import { getAllBoats, getBoatById, createBoat, isBoatOccupied } from "@/controllers/Boat";
import Router from "express";

const router = Router();

router.get("/", getAllBoats);
router.post("/", createBoat);
router.get('/isOccupied', isBoatOccupied);
router.get('/:id', getBoatById);

export default router;   