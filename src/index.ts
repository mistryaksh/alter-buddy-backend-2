import bodyParser from "body-parser";
import express, { Express, NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import { errorHandler, notFoundMiddleware } from "./middleware";
import { registerRoutesV1 } from "api";
import cookieParser from "cookie-parser";
import config from "config";
import "./utils/cron.utils";

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
          this.express.use(express.text());
          this.express.set("ipaddr", "127.0.0.1");
          this.express.set("port", 8080);
          this.express.use(cookieParser());
          this.express.use(morgan("dev"));
          this.express.use(
               cors({
                    origin: "*",
                    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
                    credentials: true, // If needed
               })
          );
          // this.express.use(createClient({}));
     }

     private useErrorHandler() {
          this.express.use(errorHandler);
     }

     private useNotFoundMiddleware() {
          this.express.use(notFoundMiddleware);
     }

     private routes(): void {
          registerRoutesV1(this.express);
     }

     private async connectDb() {
          try {
               const database = await mongoose.connect(config.get("DB_PATH"), {
                    serverSelectionTimeoutMS: 30000,
                    socketTimeoutMS: 45000,
               });
               console.log(
                    "connected to database",
                    database.connection.db.databaseName
               );
          } catch (err) {
               return console.log(err);
          }
     }
}

const app = new App();
const AppServer = app.express;

export default AppServer;
