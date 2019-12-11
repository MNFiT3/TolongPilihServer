import { Router } from "express";
import TolongPilih from "../controllers/TolongPilihController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.post("/test", TolongPilih.test)

router.post("/group/create", [checkJwt], TolongPilih.createGroup)
router.post("/group/join", [checkJwt], TolongPilih.joinGroup)
router.post("/group/leave", [checkJwt], TolongPilih.leaveGroup)
router.post("/group/invite", [checkJwt], TolongPilih.inviteGroup)
router.post("/group/list", [checkJwt], TolongPilih.groupList)

router.post("/group/item/add", [checkJwt], TolongPilih.addItems)
router.post("/group/item/remove", [checkJwt], TolongPilih.removeItems)
router.post("/group/item/list", [checkJwt], TolongPilih.itemList)

router.post("/", [checkJwt], TolongPilih.tolongPilih)

export default router;