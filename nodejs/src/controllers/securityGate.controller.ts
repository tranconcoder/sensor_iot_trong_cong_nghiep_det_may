import type { Application, Request, Response, NextFunction } from "express";

export default class SecurityGateController {
    public authSerialNumber(req: Request, res: Response, next: NextFunction) {
        console.log(Number(req.body?.serial_number as string));
    }
}
