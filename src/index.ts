import bodyParser from "body-parser";
import express, { Express, NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import { errorHandler, notFoundMiddleware } from "./middleware";
import { registerRoutesV1 } from "api";
import cookieParser from "cookie-parser";
import config from "config";

class App {
     express: Express;

     constructor() {
          this.express = express();
          this.middleware();
          this.connectDb();
          this.routes();
          this.useErrorHandler();
          this.useNotFoundMiddleware();
     }

     // Configure Express middleware.
     private middleware(): void {
          this.express.use(bodyParser.json());
          this.express.use(bodyParser.urlencoded({ extended: true }));
          this.express.use(express.json());
          this.express.use(this.useCorsMiddleware);
          this.express.use(express.text());
          this.express.use(
               cors({
                    origin: "*",
                    allowedHeaders: ["Authorization"],
               })
          );
          this.express.set("ipaddr", "127.0.0.1");
          this.express.set("port", 8080);
          this.express.use(cookieParser());
          this.express.use(morgan("dev"));
     }

     private useErrorHandler() {
          this.express.use(errorHandler);
     }

     private useCorsMiddleware(req: Request, res: Response, next: NextFunction) {
          res.setHeader("Access-Control-Allow-Origin", [
               "https://alterbuddy.com",
               "https://alterbuddyadmin.netlify.app",
          ]);
          res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
          res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
          res.setHeader("Access-Control-Allow-Credentials", "true");
          next();
     }

     private useNotFoundMiddleware() {
          this.express.use(notFoundMiddleware);
     }

     private routes(): void {
          registerRoutesV1(this.express);
     }

     private async connectDb() {
          try {
               await mongoose.connect(config.get("DB_PATH"), {});
               console.log("connected to database");
          } catch (err) {
               return console.log(err);
          }
     }
}

const app = new App();
const AppServer = app.express;

export default AppServer;
