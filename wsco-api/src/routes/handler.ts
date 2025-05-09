import { Router } from "express";
import admin from "./adminRoutes";
import auth from "./authRoutes";
import reservation from "./reservationRoutes";
import boat from "./boatRoutes";

const router = Router();


router.use('/admin', admin);
router.use('/auth', auth);
router.use('/reservation', reservation);
router.use('/boat', boat);

export default router;
