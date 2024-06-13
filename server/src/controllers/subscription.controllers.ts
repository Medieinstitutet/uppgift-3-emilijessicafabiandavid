import { Request, Response } from 'express';
import Subscription from '../models/Subscription';
import User from '../models/User';
import { Stripe } from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
});

export const getUserSubscription = async (req: Request, res: Response) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    res.status(400).json({ error: 'Session ID is required' });
    return;
  }

  try {
    console.log('Fetching user with sessionId:', sessionId);
    const user = await User.findOne({ stripeId: sessionId });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    console.log('User found:', user);
    const subscription = await Subscription.findOne({ userId: user._id });
    
    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }
    
    console.log('Subscription found:', subscription);
    res.status(200).json({ subscriptionLevel: subscription.level });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateUserSubscription = async (req: Request, res: Response) => {
  const { sessionId, subscriptionLevel } = req.body;

  if (!sessionId || !subscriptionLevel) {
    res.status(400).json({ error: 'Session ID and subscription level are required' });
    return;
  }

  try {
    const user = await User.findOne({ stripeId: sessionId });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const subscription = await Subscription.findOne({ userId: user._id });

    if (!subscription) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }

    // Update the subscription level on Stripe
    const updatedSubscription = await stripe.subscriptions.update(subscription.stripeSubId, {
      items: [{
        id: subscription.stripeSubId,
        price: subscriptionLevel, // Ensure to provide the correct price ID here
      }]
    });

    // Update the subscription level in the local database
    subscription.level = subscriptionLevel;
    await subscription.save();

    res.json({ message: 'Subscription updated successfully', subscription: updatedSubscription });
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: error.message });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  const { sessionId, subscriptionId } = req.body;

  if (!sessionId || !subscriptionId) {
    res.status(400).json({ error: 'Session ID and Subscription ID are required' });
    return;
  }

  try {
    // Cancel the subscription on Stripe
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);

    // Find and update the subscription status in the local database
    const user = await User.findOne({ stripeId: sessionId });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const subscription = await Subscription.findOneAndUpdate(
      { userId: user._id, stripeSubId: subscriptionId },
      { status: 'canceled', nextBillingDate: null },
      { new: true }
    );

    if (!subscription) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }

    res.json({ message: 'Subscription cancelled successfully', subscription });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getFailedPaymentLink = async (req: Request, res: Response) => {
  const { subscriptionId } = req.query;

  if (!subscriptionId) {
    res.status(400).json({ error: 'Subscription ID is required' });
    return;
  }

  try {
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubId);

    if (!stripeSubscription.latest_invoice) {
      res.status(404).json({ error: 'No latest invoice found for this subscription' });
      return;
    }

    const invoice = await stripe.invoices.retrieve(stripeSubscription.latest_invoice as string);

    if (!invoice.hosted_invoice_url) {
      res.status(404).json({ error: 'No hosted invoice URL found for this invoice' });
      return;
    }

    res.json({ url: invoice.hosted_invoice_url });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// export const getSubscriptionBySessionId = async (req: Request, res: Response) => {
//   const { stripeSubId } = req.query;
// console.log('stripeId:-------------------------------------------', stripeSubId);
//   if (!stripeSubId) {
//     res.status(400).json({ error: 'Session ID is required HOHO' });
//     return;
//   }

//   try {
//     console.log('Fetching user with stripeSubId:', stripeSubId);
//     const user = await User.findOne({ stripeSubId: stripeSubId });

//     if (!user) {
//       res.status(404).json({ error: 'User not found' });
//       return;
//     }

//     console.log('User found:', user);
//     const subscription = await Subscription.findOne({ userId: user._id });

//     if (!subscription) {
//       res.status(404).json({ error: 'Subscription not found' });
//       return;
//     }

//     console.log('Subscription found:', subscription);
//     const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubId);
//     res.json({
//       subscriptionLevel: subscription.level,
//       nextBillingDate: new Date(stripeSubscription.current_period_end * 1000),
//       endDate: stripeSubscription.cancel_at_period_end ? new Date(stripeSubscription.current_period_end * 1000) : null,
//       subscriptionId: stripeSubscription.id
//     });
//   } catch (error: any) {
//     console.error('Error fetching subscription by session ID:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

export const getSubscriptionBySessionId = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.query.sessionId as string;

  if (!sessionId) {
    res.status(400).send('Session ID is required');
    return;
  }

  try {
    console.log('Fetching user with sessionId:', sessionId);
    const user = await User.findOne({ stripeId: sessionId });
    if (!user) {
      res.status(404).send('User not found');
      return;
    }

    console.log('User found:', user);
    const subscription = await Subscription.findOne({ userId: user._id });
    if (!subscription) {
      res.status(404).send('Subscription not found');
      return;
    }
    
    console.log('Subscription found:', subscription);
    res.json({
      subscriptionLevel: subscription.level,
      nextBillingDate: subscription.nextBillingDate,
      endDate: subscription.endDate,
      status: subscription.status
    });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    res.status(500).send('Error fetching subscription.');
  }
};

