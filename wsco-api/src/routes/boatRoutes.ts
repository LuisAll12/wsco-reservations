import { getAllBoats, getBoatById, createBoat, deleteBoat } from "../controllers/Boat";
import upload from "../services/Multer";
import Router from "express";

const router = Router();

router.get("/", getAllBoats);
router.get('/:id', getBoatById);
router.post("/", upload.single("image"), createBoat);
router.delete("/:id", deleteBoat)

export default router