import { Request, Response } from "express";
import { IControllerRoutes, IController, ICategoryProps, ISubCategoryProps } from "interface";
import { AuthForAdmin } from "middleware";
import { Category, SubCategory } from "model";
import { Ok, UnAuthorized } from "utils";

export class CategoryController implements IController {
     public routes: IControllerRoutes[] = [];

     constructor() {
          // CATEGORY
          this.routes.push({
               path: "/category",
               handler: this.GetAllCategory,
               method: "GET",
          });
          this.routes.push({
               path: "/category/:id",
               handler: this.GetCategoryById,
               method: "GET",
          });
          this.routes.push({
               handler: this.UploadCategory,
               method: "POST",
               path: "/category",
               middleware: [AuthForAdmin],
          });
          this.routes.push({
               handler: this.UpdateCategoryById,
               method: "PUT",
               path: "/category/:id",
               middleware: [AuthForAdmin],
          });
          this.routes.push({
               handler: this.DeleteCategoryById,
               method: "DELETE",
               path: "/category/:id",
               middleware: [AuthForAdmin],
          });

          // SUB CATEGORIES
          this.routes.push({
               handler: this.GetAllSubCategory,
               method: "GET",
               path: "/sub-category",
          });
          this.routes.push({
               handler: this.GetSubCategoryByCategoryId,
               method: "GET",
               path: "/category/sub-category/:categoryId",
          });
          this.routes.push({
               handler: this.GetSubCategoryById,
               method: "GET",
               path: "/sub-category/:subCategoryId",
          });
          this.routes.push({
               handler: this.UpdateSubCategoryById,
               method: "PUT",
               path: "/sub-category/:subCategoryId",
               middleware: [AuthForAdmin],
          });
          this.routes.push({
               handler: this.DeleteSubCategoryById,
               method: "DELETE",
               path: "/sub-category/:subCategoryId",
               middleware: [AuthForAdmin],
          });
          this.routes.push({
               handler: this.UploadSubCategory,
               method: "POST",
               path: "/sub-category",
               middleware: [AuthForAdmin],
          });
     }
     public async GetAllCategory(req: Request, res: Response) {
          try {
               const category = await Category.find().sort({ createdAt: -1 });
               return Ok(res, category);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async GetCategoryById(req: Request, res: Response) {
          try {
               const id = req.params.id;
               const category = await Category.findOne({ _id: id });
               return Ok(res, category);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async UploadCategory(req: Request, res: Response) {
          try {
               const { title } = req.body;
               if (!title) {
                    return UnAuthorized(res, "missing fields");
               } else {
                    const category = await new Category({
                         status: true,
                         title,
                    }).save();
                    return Ok(res, `${category.title} is uploaded`);
               }
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async UpdateCategoryById(req: Request, res: Response) {
          try {
               const id = req.params.id;
               const updateCategory = await Category.findOneAndUpdate(
                    { _id: id },
                    { $set: { ...JSON.parse(req.body) } },
                    { new: true }
               );
               return Ok(res, `${updateCategory.title} is updated`);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async DeleteCategoryById(req: Request, res: Response) {
          try {
               const id = req.params.id;
               await Category.findByIdAndDelete({ _id: id });
               return Ok(res, `category is deleted`);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async GetAllSubCategory(req: Request, res: Response) {
          try {
               const subCategory = await SubCategory.find().populate("categoryId").sort({ createdAt: -1 });
               return Ok(res, subCategory);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
     public async GetSubCategoryByCategoryId(req: Request, res: Response) {
          try {
               const categoryId = req.params.categoryId;
               const subCategory = await SubCategory.find({ categoryId });
               return Ok(res, subCategory);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
     public async GetSubCategoryById(req: Request, res: Response) {
          try {
               const id = req.params.subCategoryId;
               const subCategory = await SubCategory.findById({ _id: id }).populate("categoryId");
               return Ok(res, subCategory);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
     public async UploadSubCategory(req: Request, res: Response) {
          try {
               const { categoryId, label, causes, desc, subTitle, symptoms, treatment }: ISubCategoryProps = req.body;
               if (!categoryId || !label || !desc || !subTitle) {
                    return UnAuthorized(res, "missing fields");
               } else {
                    const newSubCategory = await new SubCategory({
                         categoryId,
                         label,
                         causes,
                         desc,
                         subTitle,
                         symptoms,
                         treatment,
                    }).save();

                    return Ok(res, `${newSubCategory.label} is uploaded`);
               }
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
     public async UpdateSubCategoryById(req: Request, res: Response) {
          try {
               const subCategoryId = req.params.subCategoryId;
               await SubCategory.findByIdAndUpdate(
                    { _id: subCategoryId as string },
                    { $set: { ...JSON.parse(req.body) } },
                    { new: true }
               )
                    .then((response) => {
                         return Ok(res, `${response.label} is updated`);
                    })
                    .catch((err) => {
                         return UnAuthorized(res, err);
                    });
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
     public async DeleteSubCategoryById(req: Request, res: Response) {
          try {
               const subCategoryId = req.params.subCategoryId;
               const subCategory = await SubCategory.findOne({ _id: subCategoryId });
               await SubCategory.findByIdAndDelete({ _id: subCategory._id });
               return Ok(res, `${subCategory.label} is deleted`);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
}
