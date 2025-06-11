import { Router } from "express";
import admin from "./adminRoutes";
import auth from "./authRoutes";
import reservation from "./Reservations";
import boat from "./boatRoutes";
import Checklist from "./ChecklistRoutes";

const router = Router();


router.use('/admin', admin);
router.use('/auth', auth);
router.use('/reservation', reservation);
router.use('/boat', boat);
router.use('/checklist', Checklist);

export default router;
