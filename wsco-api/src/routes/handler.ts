import { Router } from "express";
import Rout from "./adminRoutes";

const router = Router();


router.use('/admin', Rout)


export default router;