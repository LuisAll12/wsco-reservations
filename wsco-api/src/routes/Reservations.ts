import { getAllReservations } from "@/controllers/Reservations";
import { memberMiddleware } from "@/middleware/Member";
import { Router } from "express";

const router = Router();

router.get('/', memberMiddleware, getAllReservations);

export default router;