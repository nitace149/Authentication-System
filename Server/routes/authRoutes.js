import express from 'express';
import { login, logout, register } from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.get('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);

export default authRouter;