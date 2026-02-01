import type { Request, Response } from "express";
import { logger } from "../utils/logger";
import { createErrorResponse, createSuccessResponse, StatusCode } from "../types";
import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { prismaClient } from "../utils/db";
dotenv.config();

const getDsaProblem = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const problemId = Array.isArray(req.params.problemId)
      ? req.params.problemId[0]
      : req.params.problemId;

    if(!token){
        return res
          .status(StatusCode.BAD_REQUEST)
          .json(createErrorResponse("Token is missing"));
    }

    const JWT_SECRET = process.env.JWT_SECRET || "";
    const decodedPayload = jwt.verify(token, JWT_SECRET);

    const dsaProblemDetails = await prismaClient.dsa_problems.findUnique({where: {id: problemId}, include: {
        test_cases: {
            where: {is_hidden: false},
            select: {
                input: true,
                expected_output: true
            }
        }
    }});

    if(!dsaProblemDetails){
        return res
          .status(StatusCode.NOT_FOUND)
          .json(createErrorResponse("PROBLEM_NOT_FOUND"));
    }

    return res.status(StatusCode.OK).json(createSuccessResponse(dsaProblemDetails));
  } catch (error: any) {
    logger.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(StatusCode.UNAUTHORIZED)
        .json(createErrorResponse("UNAUTHORIZED"));
    }
    return res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json(createErrorResponse("Error while fetching DSA Problem"));
  }
};

export { getDsaProblem };
