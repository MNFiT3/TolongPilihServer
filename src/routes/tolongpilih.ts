import { Router } from "express";
import TolongPilih from "../controllers/TolongPilihController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.post("/group/create", [checkJwt], TolongPilih.createGroup)
router.post("/group/join", [checkJwt], TolongPilih.joinGroup)
router.post("/group/leave", [checkJwt], TolongPilih.leaveGroup)

export default router;