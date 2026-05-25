import { Router, type IRouter } from "express";
import healthRouter from "./health";
import habitsRouter from "./habits";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(habitsRouter);
router.use(statsRouter);

export default router;
