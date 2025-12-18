import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import userRouter from "./routes/adminUser";
import { AppError } from "./errors/appError";
import { globalErrorHandler } from "./middleware/errorHandler";
import cors from "cors";
const app: Application = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

// use validation routes
app.use("/users", userRouter);

// Handle unhandled routes & err
app.use((req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});
app.use(globalErrorHandler);

export default app;
