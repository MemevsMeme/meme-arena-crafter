import express from 'express';
import { register, login, logout, getCurrentUser, generateRandomAvatar, updateProfile, isAuthenticated } from './auth';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/user', getCurrentUser);
router.post('/generate-avatar', generateRandomAvatar);
router.put('/profile', isAuthenticated, updateProfile);

export default router;