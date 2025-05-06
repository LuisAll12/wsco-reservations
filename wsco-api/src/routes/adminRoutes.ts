import Router from 'express';
import { CreateUser } from '@/controllers/User';
import { adminMiddleware } from '@/middleware/Admin';

const router = Router();

// Admin routes
router.post('/admin/createUser', adminMiddleware, CreateUser);

export default router;