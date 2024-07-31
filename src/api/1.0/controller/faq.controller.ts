import { Request, Response } from "express";
import { IControllerRoutes, IController, IFaqProps } from "interface";
import { AuthForAdmin } from "middleware";
import { Faq } from "model";
import { Created, Ok, UnAuthorized } from "utils";

export class FaqController implements IController {
  public routes: IControllerRoutes[] = [];

  constructor() {
    this.routes.push({
      path: "/faq",
      handler: this.UploadFaq,
      method: "POST",
      middleware: [AuthForAdmin],
    });
    this.routes.push({
      handler: this.GetAllFaq,
      method: "GET",
      path: "/faq",
    });
    this.routes.push({
      handler: this.DeleteFaqById,
      method: "DELETE",
      path: "/faq/:id",
      middleware: [AuthForAdmin],
    });
    this.routes.push({
      handler: this.UploadMoreFaq,
      method: "POST",
      path: "/faq/many",
    });
  }

  public async UploadMoreFaq(req: Request, res: Response) {
    try {
      const faq: IFaqProps[] = req.body;
      const faqs = await Faq.insertMany(faq);
      return Ok(res, faqs);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }
  public async UploadFaq(req: Request, res: Response) {
    try {
      const { answer, question }: IFaqProps = req.body;
      if (!answer || !question) {
        return UnAuthorized(res, "missing fields");
      } else {
        const newFaq = await new Faq({
          answer,
          question,
        }).save();

        return Ok(res, `${newFaq.question} is uploaded`);
      }
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }
  public async GetAllFaq(req: Request, res: Response) {
    try {
      const faq = await Faq.find().sort({ createdAt: 1 });
      return Ok(res, faq);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }
  public async DeleteFaqById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      await Faq.findOneAndDelete({ _id: id });
      return Ok(res, `faq is deleted`);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }
}
