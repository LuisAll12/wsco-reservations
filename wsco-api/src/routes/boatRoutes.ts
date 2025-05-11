import { getAllBoats, getBoatById, createBoat, deleteBoat, isBoatOccupied } from "../controllers/Boat";
import upload from "../services/Multer";
import { BootManagerMiddleware } from "@/middleware/Bootmanager";
import { memberMiddleware } from "@/middleware/Member";
import Router from "express";

const router = Router();

router.delete("/:id", deleteBoat)
router.get("/", memberMiddleware, getAllBoats);
router.post("/", BootManagerMiddleware, upload.single("image"), createBoat);
router.get('/isOccupied', memberMiddleware, isBoatOccupied);
router.get('/:id', memberMiddleware, getBoatById);

export default router;   