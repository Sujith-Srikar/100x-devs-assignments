import { type Request, type Response } from "express";
import { prismaClient } from "../utils/db";
import {
  StatusCode,
  createErrorResponse,
  createSuccessResponse,
} from "../types";
import bcrypt from "bcrypt";
import { logger } from "../utils/logger";

const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prismaClient.users.findFirst({
      where: { email: email },
    });

    if (existingUser) {
      res.status(StatusCode.CONFLICT).json(createErrorResponse('User Already Exists'));
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    const user = await prismaClient.users.create({data: {
      name: name,
      email: email,
      password: hashedpassword,
      role: role
    }});

    return res.status(StatusCode.CREATED).json(createSuccessResponse({"id": user.id, "name": user.name, "email": user.email, "role": user.role}));
  } catch (error: any) {
    logger.error(error);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(createErrorResponse('Error while signing up'))
  }
};

export {signup}