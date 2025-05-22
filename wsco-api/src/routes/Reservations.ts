import { createReservation, getAllReservations, getUsersReservations, MarkReservationAsCheckedin, setReservationAsCancelled, getReservationsTasklist } from "../controllers/Reservation";
import { memberMiddleware } from "../middleware/Member";
import { Router } from "express";

const router = Router();

router.get('/', memberMiddleware, getAllReservations);
router.post('/create', memberMiddleware, createReservation);
router.get('/user', memberMiddleware, getUsersReservations);
router.post('/checkin', memberMiddleware, MarkReservationAsCheckedin);
router.post('/cancel/:id', memberMiddleware, setReservationAsCancelled);
router.get('/:id/tasklist', memberMiddleware, getReservationsTasklist);


export default router;