import express from "express";
import { getDsaProblem } from "../controllers/problems.controller";

const router = express.Router();
router.get('/:problemId', getDsaProblem);

export default router;