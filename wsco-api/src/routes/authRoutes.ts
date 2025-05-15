import { AuthenticateUser, FinishAuth, GetRole, GetUserSession, LogoutUser } from '../controllers/User';
import { memberMiddleware } from '../middleware/Member';
import Router from 'express';

const router = Router();

router.post('/', AuthenticateUser);
router.post('/finish', FinishAuth);
router.get('/session', memberMiddleware, GetUserSession);
router.get('/logout', memberMiddleware, LogoutUser);
router.get('/role', memberMiddleware, GetRole);

export default router;