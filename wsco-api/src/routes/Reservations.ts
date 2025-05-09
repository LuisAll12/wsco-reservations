import { createReservation, getAllReservations, getUsersReservations } from "@/controllers/Reservation";
import { memberMiddleware } from "@/middleware/Member";
import { Router } from "express";

const router = Router();

router.get('/', memberMiddleware, getAllReservations);
router.post('/create', memberMiddleware, createReservation);
router.get('/user', memberMiddleware, getUsersReservations);


export default router;