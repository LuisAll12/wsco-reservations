import { createReservation, getAllReservations } from "@/controllers/Reservation";
import { memberMiddleware } from "@/middleware/Member";
import { Router } from "express";

const router = Router();

router.get('/', memberMiddleware, getAllReservations);
router.post('/create', memberMiddleware, createReservation);


export default router;