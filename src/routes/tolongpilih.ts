import { Router } from "express";
import TolongPilih from "../controllers/TolongPilihController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.post("/group/join", [checkJwt], TolongPilih.joinGroup);

export default router;