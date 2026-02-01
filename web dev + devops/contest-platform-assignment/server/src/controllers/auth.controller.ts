import { type Request, type Response } from "express";
import { prismaClient } from "../utils/db";
import {
  StatusCode,
  createErrorResponse,
  createSuccessResponse,
} from "../types";
import bcrypt from "bcrypt";
import { logger } from "../utils/logger";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prismaClient.users.findFirst({
      where: { email: email },
    });

    if (existingUser) {
      res
        .status(StatusCode.BAD_REQUEST)
        .json(createErrorResponse("EMAIL_ALREADY_EXISTS"));
      return;
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

const login = async (req: Request, res: Response) => {
  try {
    const {email, password} = req.body;

    const user = await prismaClient.users.findUnique({where: {email: email}});

    if(!user){
      res.status(StatusCode.NOT_FOUND).json(createErrorResponse('User not Found'));
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      res
        .status(StatusCode.UNAUTHORIZED)
        .json(createErrorResponse("INVALID_CREDENTIALS"));
    }

    const JWT_SECRET = process.env.JWT_SECRET || "";
    const token = jwt.sign({"userId": user.id, "role": user.role}, JWT_SECRET);

    res.status(StatusCode.OK).json(createSuccessResponse({"token": token}));

  } catch (error: any) {
    logger.error(error);
    return res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json(createErrorResponse("Error while loggin in"));
  }
}

export {signup, login}