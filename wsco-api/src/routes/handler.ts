import { Router } from "express";
import admin from "./adminRoutes";
import auth from "./authRoutes";

const router = Router();


router.use('/admin', admin);
router.use('/auth', auth);

export default router;