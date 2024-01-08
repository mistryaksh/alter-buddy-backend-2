import { Request, Response } from "express";
import { IControllerRoutes, IController, IBlogProps } from "interface";
import { AuthForMentor } from "middleware";
import { Blog } from "model";
import { Ok, UnAuthorized } from "utils";

export class BlogController implements IController {
     public routes: IControllerRoutes[] = [];

     constructor() {
          this.routes.push({
               path: "/blog",
               handler: this.GetAllBlog,
               method: "GET",
          });
          this.routes.push({
               handler: this.GetBlogById,
               method: "GET",
               path: "/blog/:id",
          });
          this.routes.push({
               handler: this.UploadBlog,
               method: "POST",
               path: "/blog",
          });
          this.routes.push({
               handler: this.UpdateBlogById,
               method: "PUT",
               path: "/blog/:id",
          });
          this.routes.push({
               handler: this.DeleteBlogById,
               method: "DELETE",
               path: "/blog/:id",
          });
     }
     public async GetAllBlog(req: Request, res: Response) {
          try {
               const blog = await Blog.find().sort({ createdAt: -1 });
               return Ok(res, blog);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
     public async GetBlogById(req: Request, res: Response) {
          try {
               const id = req.params.id;
               const blog = await Blog.findById({ _id: id });
               return Ok(res, blog);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
     public async UploadBlog(req: Request, res: Response) {
          try {
               const { body, label, subLabel } = req.body;
               console.log(body, label, subLabel);
               if (!body || !label || !subLabel) {
                    return UnAuthorized(res, "missing fields");
               } else {
                    const blog = await new Blog({ ...req.body }).save();
                    return Ok(res, `${blog.label} is uploaded`);
               }
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
     public async UpdateBlogById(req: Request, res: Response) {
          try {
               const id = req.params.id;
               const blog = await Blog.findByIdAndUpdate({ _id: id }, { $set: { ...JSON.parse(req.body) } });
               return Ok(res, `${blog.label} is updated`);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
     public async DeleteBlogById(req: Request, res: Response) {
          try {
               const id = req.params.id;
               await Blog.findOneAndDelete({ _id: id });
               return Ok(res, `blog is deleted`);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
}
