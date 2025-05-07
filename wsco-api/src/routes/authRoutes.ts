import { AuthenticateUser, FinishAuth } from '@/controllers/User';
import Router from 'express';

const router = Router();

router.post('/', AuthenticateUser);
router.post('/finish', FinishAuth)

export default router;