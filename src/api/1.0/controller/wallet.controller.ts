import { Request, Response } from "express";
import { IControllerRoutes, IController } from "interface";
import { User, Wallet } from "model";
import { getTokenFromHeader, Ok, UnAuthorized, verifyToken } from "utils";

export class WalletController implements IController {
     public routes: IControllerRoutes[] = [];

     constructor() {
          this.routes.push({
               path: "/my/wallet",
               handler: this.GetMyWallet,
               method: "GET",
          });
     }
     public async GetMyWallet(req: Request, res: Response) {
          try {
               const token = getTokenFromHeader(req);
               const verified = verifyToken(token);
               const user = await User.findById({ _id: verified.id });
               const wallet = await Wallet.findOne({ userId: user });
               return Ok(res, wallet);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
}
