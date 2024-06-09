// auth.router.ts
import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/auth.controllers';

const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser); // Se till att detta finns
authRouter.post('/logout', logoutUser);

export default authRouter;
