import { Router, Request, Response } from "express";
import auth from "./auth";
import user from "./user";
import tolongpilih from "./tolongpilih";

const routes = Router();

routes.use("/auth", auth);
routes.use("/user", user);
routes.use("/tolongpilih", tolongpilih);

export default routes;
