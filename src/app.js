import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { requireAuthMiddleware, requireRole } from "./middlewares/clerkAuthMiddleware.js";

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
import userRouter from './routes/user.routes.js';


// routes declaration
app.use("/users", userRouter);

export { app };