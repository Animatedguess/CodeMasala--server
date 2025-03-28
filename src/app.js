import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { requireAuthMiddleware } from "./middlewares/clerkAuthMiddleware.js";

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static('public'));

app.use(cookieParser());

//routes import
import problemRouter from './routes/problem.routes.js';
import solutionRouter from './routes/solution.routes.js';
import userRouter from './routes/user.routes.js';
import submissionRouter from './routes/submission.routes.js';


// routes declaration
app.use("/problem", problemRouter);
app.use("/solution", solutionRouter);
app.use("/user", userRouter);
app.use("/submission", submissionRouter);

export { app };