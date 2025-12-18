import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import adminUserRouter from "./routes/adminUser";

const app: Application = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.use(express.json());
app.use("/users", adminUserRouter);

export default app;
