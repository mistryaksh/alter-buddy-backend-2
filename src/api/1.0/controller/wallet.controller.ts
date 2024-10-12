import { Request, Response } from "express";
import { IControllerRoutes, IController } from "interface";
import { AuthForAdmin, AuthForUser } from "middleware";
import { User, BuddyCoins, Transaction } from "model";
import { RazorPayService } from "services/razorpay.services";
import { getTokenFromHeader, Ok, UnAuthorized, verifyToken } from "utils";

function generateCustomTransactionId(
  prefix: string,
  totalLength: number
): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const prefixLength = prefix.length;
  const separator = "-";

  // Calculate the length of the random string component
  const randomStringLength = totalLength - prefixLength - separator.length;

  if (randomStringLength <= 0) {
    throw new Error(
      "Total length must be greater than the length of the prefix and separator."
    );
  }

  let randomString = "";

  // Generate a random string of the calculated length
  for (let i = 0; i < randomStringLength; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomString += chars[randomIndex];
  }

  // Create the transaction ID by combining the prefix with the random string
  return `${prefix}${separator}${randomString}`;
}

export class WalletController implements IController {
  public routes: IControllerRoutes[] = [];

  constructor() {
    this.routes.push({
      path: "/wallets",
      handler: this.GetAllWallets,
      method: "GET",
      middleware: [AuthForAdmin],
    }),
      this.routes.push({
        path: "/buddy-coins",
        handler: this.GetMyWallet,
        method: "GET",
        middleware: [AuthForUser],
      });
    this.routes.push({
      handler: this.CreateBuddyCoinsRecharge,
      method: "POST",
      path: "/buddy-coins/recharge",
    });
    this.routes.push({
      handler: this.ValidateRecharge,
      method: "GET",
      path: "/buddy-coins/process/:pLinkId",
    });
    this.routes.push({
      handler: this.UseBuddyCoins,
      method: "PUT",
      path: "/buddy-coins/use",
    });
    this.routes.push({
      handler: this.GetMyTransactions,
      method: "GET",
      path: "/buddy-coins/transactions/my",
    });
  }

  public GetAllWallets = async (req: Request, res: Response) => {
    try {
      const wallet = await BuddyCoins.find().populate("userId");
      return Ok(res, wallet);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  };

  public async GetMyWallet(req: Request, res: Response) {
    try {
      const token = getTokenFromHeader(req);
      const verified = verifyToken(token);
      const user = await User.findById({ _id: verified.id });
      const wallet = await BuddyCoins.findOne({ userId: user });
      if (!wallet) {
        await new BuddyCoins({ balance: 0, userId: user._id }).save();
        return Ok(res, wallet);
      } else return Ok(res, wallet);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async CreateBuddyCoinsRecharge(req: Request, res: Response) {
    try {
      const { amount } = req.body;
      if (!amount) {
        return UnAuthorized(res, "please enter an amount");
      }

      const token = getTokenFromHeader(req);
      const verified = verifyToken(token);
      const user = await User.findById({ _id: verified.id });

      const razorPay = await RazorPayService.StartPayment({
        amount,
        email: user.email,
        userName: `${user.name.firstName} ${user.name.lastName}`,
        mobile: user.mobile,
      });

      return Ok(res, {
        message: "payment link generated",
        razorPay,
      });
    } catch (err) {
      if (err.error) {
        return UnAuthorized(res, err.error.description);
      }
      return UnAuthorized(res, err);
    }
  }

  public async ValidateRecharge(req: Request, res: Response) {
    try {
      const { pLinkId } = req.params;
      if (!pLinkId) {
        return UnAuthorized(res, "missing payment id");
      }

      const paymentStatus = await RazorPayService.VerifySignature({
        paymentId: pLinkId,
      });
      const token = getTokenFromHeader(req);
      const verified = verifyToken(token);
      const user = await User.findById({ _id: verified.id });
      const wallet = await BuddyCoins.findOne({ userId: user });
      const rechargeAmount =
        wallet.balance + parseInt(paymentStatus.payment.amount.toString());
      const updatedWallet = await BuddyCoins.findByIdAndUpdate(
        { _id: wallet._id },
        {
          $set: {
            balance: rechargeAmount,
          },
        }
      );
      if (paymentStatus.message === "payment successful") {
        await new Transaction({
          closingBal:
            wallet.balance + parseInt(paymentStatus.payment.amount.toString()),
          creditAmt: paymentStatus.payment.amount,
          walletId: updatedWallet._id,
          userId: user._id,
          status: "success",
          transactionType: "recharge successful",
          transactionId: generateCustomTransactionId("BDDY", 10),
        }).save();
        return Ok(res, paymentStatus);
      } else {
        await new Transaction({
          closingBal: wallet.balance,
          creditAmt: paymentStatus.payment.amount,
          walletId: updatedWallet._id,
          userId: user._id,
          status: "failed",
          transactionType: "recharge failed",
          transactionId: generateCustomTransactionId("BDDY", 10),
        }).save();
        return Ok(res, paymentStatus);
      }
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async UseBuddyCoins(req: Request, res: Response) {
    try {
      const {
        coinsToUsed,
        useType,
        userId,
      }: { coinsToUsed: number; useType: string; userId: string } = req.body;

      if (!coinsToUsed) {
        return UnAuthorized(res, "missing fields");
      }
      const user = await User.findById({ _id: userId });

      const wallet = await BuddyCoins.findOne({ userId: user._id });

      if (wallet) {
        await BuddyCoins.findByIdAndUpdate(
          { _id: wallet._id },
          { $set: { balance: wallet.balance - coinsToUsed } }
        );
        await new Transaction({
          transactionId: generateCustomTransactionId("BUDDY", 10),
          transactionType: useType,
          closingBal: wallet.balance - coinsToUsed,
          debitAmt: coinsToUsed,
          walletId: wallet._id,
          userId: user._id,
          status: "success",
        }).save();
        return Ok(res, "SUCCESS");
      } else {
        return UnAuthorized(res, "FAILED");
      }
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async GetMyTransactions(req: Request, res: Response) {
    try {
      const token = getTokenFromHeader(req);
      const verified = verifyToken(token);
      const transaction = await Transaction.find({ userId: verified.id })
        .populate("walletId")
        .populate("userId")
        .sort({ createdAt: -1 });
      return Ok(res, transaction);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }
}
