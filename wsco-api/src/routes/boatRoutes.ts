import { getAllBoats, createBoat } from "@/controllers/Boat";
import { create } from "domain";
import Router from "express";

const router = Router();

router.get("/", getAllBoats);
router.post("/", createBoat);

export default router;