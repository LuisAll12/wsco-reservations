import { Router } from "express";
import admin from "./adminRoutes";
import auth from "./authRoutes";
import reservation from "./reservationRoutes";

const router = Router();


router.use('/admin', admin);
router.use('/auth', auth);
router.use('/reservation', reservation);

export default router;