import express from "express";
import { signup } from "../controllers/auth.controller";
import { validate } from "../middlewares/validation.middleware";
import { signupSchema } from "../utils/zod";

const router = express.Router();

router.post('/signup', validate(signupSchema), signup);

export default router;