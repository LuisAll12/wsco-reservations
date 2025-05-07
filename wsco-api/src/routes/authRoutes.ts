import { AuthenticateUser, FinishAuth, GetUserSession, LogoutUser } from '@/controllers/User';
import Router from 'express';

const router = Router();

router.post('/', AuthenticateUser);
router.post('/finish', FinishAuth);
router.get('/session', GetUserSession);
router.get('/logout', LogoutUser);

export default router;