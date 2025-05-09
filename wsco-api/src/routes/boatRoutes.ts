import { getAllBoats, getBoatById, createBoat, isBoatOccupied } from "@/controllers/Boat";
import { BootManagerMiddleware } from "@/middleware/Bootmanager";
import { memberMiddleware } from "@/middleware/Member";
import Router from "express";

const router = Router();

router.get("/", memberMiddleware, getAllBoats);
router.post("/", BootManagerMiddleware, createBoat);
router.get('/isOccupied', memberMiddleware, isBoatOccupied);
router.get('/:id', memberMiddleware, getBoatById);

export default router;   