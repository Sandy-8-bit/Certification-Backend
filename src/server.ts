import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { AppError } from "./errors/appError";
import { globalErrorHandler } from "./middleware/errorHandler";
import adminUserRouter from "./routes/adminUser";
import courseRouter from "./routes/course";

const app: Application = express();

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

// use validation routes
app.use("/users", adminUserRouter);
app.use("/course", courseRouter);

// Handle unhandled routes & err
app.use((req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});
app.use(globalErrorHandler);

export default app;
