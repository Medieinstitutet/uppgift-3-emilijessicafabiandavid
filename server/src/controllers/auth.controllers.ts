import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { Session, SessionData } from 'express-session';
import { stripe } from './stripe.controllers';
import Subscription from '../models/Subscription';

interface CustomRequest extends Request {
  session: Session & Partial<SessionData> & {
    userId?: string;
  };
}

export const registerUser = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  const { email, password, firstName, lastName, subscriptionId, role } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }
  const user = new User({
    email,
    password,
    firstName,
    lastName,
    subscriptionId,
    role,
  });

  try {
    await user.save();
    req.session.userId = user._id.toString();

    if (!req.body.selectedProduct || !req.body.selectedProduct.priceId) {
      res.status(400).json({ message: 'Selected product or priceId is missing' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: req.body.selectedProduct.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:5173/mypages',
      cancel_url: 'https://www.visit-tochigi.com/plan-your-trip/things-to-do/2035/',
      metadata: {
        subscriptionLevel: req.body.selectedProduct.name,
      },
    });

    console.log("Stripe Checkout Session Created:", session.id);
    user.sessionId = session.id; // Save sessionId in user document
    await user.save();

    const subscription = new Subscription({
      userId: user._id,
      level: req.body.selectedProduct.name,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      sessionId: session.id,
    });

    await subscription.save();

    res.status(201).json({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      subscriptionId: user.subscriptionId,
      role: user.role,
      sessionId: user.sessionId,
      url: session.url,
    });
  } catch (error) {
    console.error('Error during user registration:', error);
    next(error);
  }
};

export const loginUser = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    req.session.userId = user._id.toString();
    console.log('Login user:', user);
    res.json({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      subscriptionId: user.subscriptionId,
      role: user.role,
      sessionId: user.sessionId, // Return sessionId
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

export const logoutUser = (req: CustomRequest, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ message: 'Failed to log out' });
    } else {
      res.status(200).json({ message: 'User logged out' });
    }
  });
};
