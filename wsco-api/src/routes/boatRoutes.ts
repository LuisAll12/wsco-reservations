import { getAllBoats, getBoatById, createBoat } from "../controllers/Boat";
import Router from "express";

const router = Router();

router.get("/", getAllBoats);
router.get('/:id', getBoatById);
router.post("/", createBoat);

export default router