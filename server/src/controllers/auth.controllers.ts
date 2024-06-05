import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';

import { Session, SessionData } from 'express-session';

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
    res.status(201).json({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      subscriptionId: user.subscriptionId,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
  //skapa en stripecheckout med 
//req.body.selectedProduct 
//1. se till att vi kommer till checkout
//2. lägg in sub i dbtabell efter verify stripe checkout
//3. kolla vilka fält som fortfarande är opopulerade/ejinfoisigännu och var vi kan hitta den infon (lookup)
};

export const loginUser = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    req.session.userId = user._id.toString();
    res.json({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      subscriptionId: user.subscriptionId,
      role: user.role,
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
