import { getAllBoats, getBoatById, createBoat } from "../controllers/Boat";
import upload from "../services/Multer";
import Router from "express";

const router = Router();

router.get("/", getAllBoats);
router.get('/:id', getBoatById);
router.post("/", upload.single('image'), createBoat);

export default router