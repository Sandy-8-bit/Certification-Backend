import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import userRouter from "./routes/adminUser";

const app: Application = express();

app.use(express.json());
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

// use validation routes
app.use("/users", userRouter);

export default app;
