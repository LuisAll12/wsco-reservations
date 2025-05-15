import Router from 'express';
import { CreateUser, GetAllUsers, RoleChange } from '../controllers/User';
import { adminMiddleware } from '../middleware/Admin';

const router = Router();

router.post('/createUser', adminMiddleware, CreateUser);
router.get('/getUsers', adminMiddleware, GetAllUsers);
router.put('/roleChange/:id', adminMiddleware, RoleChange);

export default router;