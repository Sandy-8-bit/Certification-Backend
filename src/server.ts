import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { AppError } from "./errors/appError";
import { globalErrorHandler } from "./middleware/errorHandler";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import adminUserRouter from "./routes/adminUser.routes";
import courseRouter from "./routes/course.routes";
import mediaRouter from "./routes/media.routes";
import webhooksRouter from "./routes/webhook.routes";

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
app.use("/api/v1/media", mediaRouter);
app.use("/api/v1/users", adminUserRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/webhooks", webhooksRouter);

// swagger ui
if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// favicon.ico handler
app.get("/favicon.ico", (_, res) => res.status(204).end());

// Handle unhandled routes & err
app.use((req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});
app.use(globalErrorHandler);

export default app;
