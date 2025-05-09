import { createReservation } from '../controllers/Reservation';
import { Router } from 'express';

const router = Router();

router.post('/', createReservation);

export default router;