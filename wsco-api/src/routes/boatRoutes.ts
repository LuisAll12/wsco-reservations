import { getAllBoats } from "@/controllers/Boat";
import Router from "express";

const router = Router();

router.get("/", getAllBoats);

export default router;