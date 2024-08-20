import { Request, Response } from "express";
import { IControllerRoutes, IController, IPackagesProps } from "interface";
import { AuthForAdmin } from "middleware";
import { Packages } from "model";
import { Ok, UnAuthorized } from "utils";

export class PackagesController implements IController {
  public routes: IControllerRoutes[] = [];

  constructor() {
    this.routes.push({
      path: "/packages",
      handler: this.GetAllPackages,
      method: "GET",
    });
    this.routes.push({
      handler: this.CreateNewPackages,
      method: "POST",
      path: "/packages",
      middleware: [AuthForAdmin],
    });
    this.routes.push({
      handler: this.UpdatePackage,
      method: "PUT",
      path: "/packages/:id",
      middleware: [AuthForAdmin],
    });
    this.routes.push({
      handler: this.DeletePackage,
      method: "DELETE",
      path: "/packages/:id",
      middleware: [AuthForAdmin],
    });
  }
  public async GetAllPackages(req: Request, res: Response) {
    try {
      const packages = await Packages.find({}).populate("categoryId");
      return Ok(res, packages);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async CreateNewPackages(req: Request, res: Response) {
    try {
      const {
        categoryId,
        packageName,
        packageType,
        description,
        price,
      }: IPackagesProps = req.body;

      if (!categoryId || !packageName || !packageType || !price) {
        return UnAuthorized(res, "missing fields");
      }

      const packageExist = await Packages.findOne({
        categoryId,
        packageType,
        packageName,
        price,
      });

      if (packageExist) {
        return UnAuthorized(res, "packages is already in the list");
      }

      const packages = await new Packages({
        categoryId,
        packageName,
        packageType,
        price,
        description,
        status: false,
      }).save({ validateBeforeSave: true });
      return Ok(res, `${packages.packageName} is created`);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async UpdatePackage(req: Request, res: Response) {
    try {
      const packages = await Packages.findByIdAndUpdate(
        { _id: req.params.id },
        { $set: { ...req.body } }
      );
      return Ok(res, `${packages.packageName} is updated`);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async DeletePackage(req: Request, res: Response) {
    try {
      await Packages.findByIdAndDelete({ _id: req.params.id });
      return Ok(res, "package removed");
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }
}
