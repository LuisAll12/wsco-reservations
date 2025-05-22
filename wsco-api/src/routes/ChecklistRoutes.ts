import { createChecklist } from "@/controllers/Tasklist";
import { adminMiddleware } from "@/middleware/Admin";
import { Router } from "express";

const router = Router();

router.post('/createTasklist', adminMiddleware, createChecklist)

export default router;