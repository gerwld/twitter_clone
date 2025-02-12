import express from 'express';
import { getMyself, login, logout, signUp } from '../controllers/auth.controller.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

router.get('/check', protectRoute, getMyself);

router.post('/login', login);

router.post('/signup', signUp);

router.post('/logout', logout);

export default router;
