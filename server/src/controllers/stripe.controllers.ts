import { Request, Response } from 'express';
import Stripe from 'stripe';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import Subscription from '../models/Subscription';
import { getAllProducts } from './articles.controllers';
import User from '../models/User';
import mongoose from 'mongoose';

dotenv.config();

console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY);

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
});

const createSubscription = async (customerId: string, priceId: string): Promise<any> => {
  try {
    const subscriptionSchedule = await stripe.subscriptionSchedules.create({
      customer: customerId,
      start_date: 'now',
      end_behavior: 'release',
      phases: [{
        items: [{
          price: priceId,
          quantity: 1,
        }],
        iterations: 52,
        billing_thresholds: {
          amount_gte: 10000,
        },
      }],
    });
    return subscriptionSchedule;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

const getSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const productsWithPrices = await getAllProducts();
    res.status(200).json(productsWithPrices);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).send('Error fetching subscriptions.');
  }
};

const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  const { selectedProduct } = req.body;

  if (!req.session || !(req.session as any).user) {
    res.status(401).end();
    return;
  }

  console.log("Creating Stripe Checkout Session");
  console.log("Session User:", (req.session as any).user);
  console.log("Selected Product:", selectedProduct);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedProduct.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:5173/mypages',
      cancel_url: 'https://www.visit-tochigi.com/plan-your-trip/things-to-do/2035/',
      metadata: {
        subscriptionLevel: selectedProduct.name,
      },
    });

    console.log("Stripe Checkout Session Created:", session.id);
    console.log("Stripe Checkout Session URL:", session.url);

    const user = await User.findById((req.session as any).userId);
    if (user) {
      console.log("Found user:", user);
      user.sessionId = session.id;
      console.log("Updating user document with sessionId:", user.sessionId);
      try {
        await user.save();
        console.log("User document saved successfully!");
      } catch (err) {
        console.error("Error saving user document:", err);
      }
    }

    const newSubscription = new Subscription({
      userId: (req.session as any).userId,
      level: selectedProduct.name,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      sessionId: session.id, // Save sessionId instead of stripeId
    });
    console.log("Creating new Subscription document:", newSubscription);
    await newSubscription.save();

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).send('Error creating checkout session.');
  }
};

const verifySession = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.body.sessionId || req.query.sessionId;
    console.log("Verifying session:", sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
      const order = {
        orderNumber: Math.floor(Math.random() * 100000000),
        customerName: session.customer_details?.name,
        subscriptions: lineItems.data,
        total: session.amount_total,
        date: new Date(),
      };

      const ordersFilePath = path.join(__dirname, '..', 'data', 'orders.json');
      const orders = JSON.parse(await fs.readFile(ordersFilePath, 'utf-8'));
      orders.push(order);
      await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 4));

      const subscription = await Subscription.findOne({ sessionId });
      if (!subscription) {
        const newSubscription = new Subscription({
          userId: (req.session as any).userId,
          level: session.metadata?.subscriptionLevel,
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          sessionId,
        });

        await newSubscription.save();

        const user = await User.findById((req.session as any).userId);
        if (user) {
          user.subscriptionId = (newSubscription._id as mongoose.Types.ObjectId).toString();
          await user.save();
        }
      }

      res.status(200).json({ verified: true });
    } else {
      res.status(200).json({ verified: false });
    }
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).send('Error verifying session.');
  }
};

const updateSubscriptionFromStripeEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventType, eventData } = req.body;

    if (eventType === 'invoice.payment_succeeded' && eventData && eventData.subscription) {
      const subscriptionId = eventData.subscription as string;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const nextBillingDate = new Date(subscription.current_period_end * 1000);

      const updatedSubscription = await Subscription.findOneAndUpdate(
        { sessionId: subscriptionId },
        { nextBillingDate },
        { new: true }
      );

      if (updatedSubscription) {
        console.log('Subscription updated successfully:', updatedSubscription);
        res.status(200).send('Subscription updated successfully.');
      } else {
        console.error('Failed to update subscription.');
        res.status(500).send('Failed to update subscription.');
      }
    } else {
      res.status(400).send('Invalid event type or missing subscription data.');
    }
  } catch (error) {
    console.error('Error updating subscription from Stripe event:', error);
    res.status(500).send('Error updating subscription from Stripe event.');
  }
};

export { createCheckoutSession, getSubscriptions, verifySession, createSubscription, updateSubscriptionFromStripeEvent };
