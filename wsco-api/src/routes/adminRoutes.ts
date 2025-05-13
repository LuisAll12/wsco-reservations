import Router from 'express';
import { CreateUser, GetAllUsers } from '../controllers/User';
import { adminMiddleware } from '../middleware/Admin';

const router = Router();

router.post('/createUser', adminMiddleware, CreateUser);
router.get('/getUsers', adminMiddleware, GetAllUsers);

export default router;