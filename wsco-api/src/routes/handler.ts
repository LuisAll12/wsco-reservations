import { Router } from "express";
import admin from "./adminRoutes";
import auth from "./authRoutes";
import reservations from "./Reservations";

const router = Router();

router.use('/reservations', reservations)
router.use('/admin', admin);
router.use('/auth', auth);

export default router;