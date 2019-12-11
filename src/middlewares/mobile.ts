import { Request, Response, NextFunction } from "express-serve-static-core";

export const mobile = (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.PostData)
    next()
};