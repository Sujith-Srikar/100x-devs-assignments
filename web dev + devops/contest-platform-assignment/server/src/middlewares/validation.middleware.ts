import * as z from "zod";
import type { Request, Response, NextFunction } from "express";
import { StatusCode, createErrorResponse } from "../types";
import { logger } from "../utils/logger";

export const validate =
  (schema: z.ZodObject<any, any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      logger.error("Validate Schema error", error);
      if (error instanceof z.ZodError) {
        const err = z.treeifyError(error);
        const errmsgs = err.errors;
        res
          .status(StatusCode.BAD_REQUEST)
          .json(createErrorResponse("INVALID_REQUEST"));
      } else {
        res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json(createErrorResponse("Internal Server Error"));
      }
    }
  };
