import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import {
  createErrorResponse,
  createSuccessResponse,
  StatusCode,
  type JwtPayload,
  type leaderBoardRow,
  type Test_Cases,
} from "../types";
import { prismaClient } from "../utils/db";
import { logger } from "../utils/logger";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
dotenv.config();

const createNewContest = async (req: Request, res: Response) => {
  try {
    const { title, description, startTime, endTime } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json(createErrorResponse("Token is missing"));
    }

    const JWT_SECRET = process.env.JWT_SECRET || "";
    const decodedPayload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (decodedPayload.role != "creator") {
      return res
        .status(StatusCode.FORBIDDEN)
        .json(createErrorResponse("FORBIDDEN"));
    }

    const constest = await prismaClient.contests.create({
      data: {
        title: title,
        description: description,
        start_time: startTime,
        end_time: endTime,
        creator_id: decodedPayload.userId,
      },
    });

    return res.status(StatusCode.CREATED).json(createSuccessResponse(constest));
  } catch (error: any) {
    logger.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(StatusCode.UNAUTHORIZED)
        .json(createErrorResponse("UNAUTHORIZED"));
    }
    return res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json(createErrorResponse("Error while creating new contest"));
  }
};

const getContestDetails = async (req: Request, res: Response) => {
  try {
    const contestId = Array.isArray(req.params.contestId)
      ? req.params.contestId[0]
      : req.params.contestId;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json(createErrorResponse("Token is missing"));
    }

    const JWT_SECRET = process.env.JWT_SECRET || "";
    const decodedPayload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const mcq_select = {
      id: true,
      question_text: true,
      options: true,
      points: true,
      ...(decodedPayload.role === "creator" && {
        correct_option_index: true,
      }),
    };

    const contestDetails = await prismaClient.contests.findUnique({
      where: { id: contestId },
      include: {
        dsa_problems: true,
        mcq_questions: {
          select: mcq_select,
        },
      },
    });

    if (!contestDetails) {
      return res
        .status(StatusCode.NOT_FOUND)
        .json(createErrorResponse("CONTEST_NOT_FOUND"));
    }

    return res
      .status(StatusCode.OK)
      .json(createSuccessResponse(contestDetails));
  } catch (error: any) {
    logger.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(StatusCode.UNAUTHORIZED)
        .json(createErrorResponse("UNAUTHORIZED"));
    }
    return res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json(createErrorResponse("Error while fetching contest details"));
  }
};

const addMcqToContest = async (req: Request, res: Response) => {
  try {
    const { questionText, options, correctOptionIndex, points } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    const contestId = Array.isArray(req.params.contestId)
      ? req.params.contestId[0]
      : req.params.contestId;

    if (!token) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json(createErrorResponse("Token is missing"));
    }

    const JWT_SECRET = process.env.JWT_SECRET || "";
    const decodedPayload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (decodedPayload.role != "creator") {
      return res
        .status(StatusCode.FORBIDDEN)
        .json(createErrorResponse("FORBIDDEN"));
    }

    const contest = await prismaClient.contests.findUnique({
      where: { id: contestId },
    });

    if (!contest) {
      return res
        .status(StatusCode.NOT_FOUND)
        .json(createErrorResponse("CONTEST_NOT_FOUND"));
    }

    const mcq = await prismaClient.mcq_questions.create({
      data: {
        question_text: questionText,
        options: options,
        correct_option_index: correctOptionIndex,
        points: points,
        contest_id: contest.id,
      },
    });

    return res
      .status(StatusCode.CREATED)
      .json(createSuccessResponse({ id: mcq.id, contestId: mcq.contest_id }));
  } catch (error: any) {
    logger.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(StatusCode.UNAUTHORIZED)
        .json(createErrorResponse("UNAUTHORIZED"));
    }
    return res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json(createErrorResponse("Error while adding mcq to a contest"));
  }
};

const submitMcq = async (req: Request, res: Response) => {
  try {
    const { selectedOptionIndex } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    const contestId = Array.isArray(req.params.contestId)
      ? req.params.contestId[0]
      : req.params.contestId;
    const questionId = Array.isArray(req.params.questionId)
      ? req.params.questionId[0]
      : req.params.questionId;

    if (!token) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json(createErrorResponse("Token is missing"));
    }

    const JWT_SECRET = process.env.JWT_SECRET || "";
    const decodedPayload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (decodedPayload.role != "contestee") {
      return res
        .status(StatusCode.FORBIDDEN)
        .json(createErrorResponse("FORBIDDEN"));
    }

    const mcq = await prismaClient.mcq_questions.findUnique({
      where: { id: questionId },
      select: {
        correct_option_index: true,
        points: true,
        contest: {
          select: {
            id: true,
            end_time: true,
          },
        },
      },
    });

    if (!mcq) {
      return res
        .status(StatusCode.NOT_FOUND)
        .json(createErrorResponse("QUESTION_NOT_FOUND"));
    }

    if (mcq.contest.id !== contestId) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json(createErrorResponse("QUESTION_NOT_IN_CONTEST"));
    }

    if (mcq.contest.end_time < new Date()) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json(createErrorResponse("CONTEST_NOT_ACTIVE"));
    }

    let points_earned: number = 0;
    let isCorrect: boolean = false;
    if (mcq.correct_option_index == selectedOptionIndex) {
      isCorrect = true;
      points_earned = mcq.points;
    }

    const submissionRes = await prismaClient.mcq_submissions.create({
      data: {
        user_id: decodedPayload.userId,
        question_id: questionId,
        selected_option_index: selectedOptionIndex,
        is_correct: isCorrect,
        points_earned: points_earned,
      },
    });

    return res.status(StatusCode.CREATED).json(
      createSuccessResponse({
        isCorrect: submissionRes.is_correct,
        points_earned: submissionRes.points_earned,
      }),
    );
  } catch (error: any) {
    logger.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(StatusCode.UNAUTHORIZED)
        .json(createErrorResponse("UNAUTHORIZED"));
    }
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json(createErrorResponse("ALREADY_SUBMITTED"));
    }
    return res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json(createErrorResponse("Error while submitting mcq answer"));
  }
};

const addDsaToContest = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      tags,
      points,
      timeLimit,
      memoryLimit,
      testCases,
    } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    const contestId = Array.isArray(req.params.contestId)
      ? req.params.contestId[0]
      : req.params.contestId;

    if (!token) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json(createErrorResponse("Token is missing"));
    }

    const formattedTestCases: Test_Cases[] = testCases.map(
      (tc: any): Test_Cases => ({
        input: tc.input,
        expected_output: tc.expectedOutput,
        is_hidden: tc.isHidden,
      }),
    );

    const JWT_SECRET = process.env.JWT_SECRET || "";
    const decodedPayload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (decodedPayload.role != "creator") {
      return res
        .status(StatusCode.FORBIDDEN)
        .json(createErrorResponse("FORBIDDEN"));
    }

    const dsaProblem = await prismaClient.dsa_problems.create({
      data: {
        title,
        description,
        tags,
        points,
        time_limit: timeLimit,
        memory_limit: memoryLimit,

        contest: {
          connect: { id: contestId },
        },

        test_cases: {
          createMany: {
            data: formattedTestCases,
          },
        },
      },

      select: {
        id: true,
        contest_id: true,
      },
    });


    return res.status(StatusCode.CREATED).json(
      createSuccessResponse({
        id: dsaProblem.id,
        contestId: dsaProblem.contest_id,
      }),
    );
  } catch (error: any) {
    logger.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(StatusCode.UNAUTHORIZED)
        .json(createErrorResponse("UNAUTHORIZED"));
    }
    return res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json(createErrorResponse("Error adding dsa problem to the contest"));
  }
};

const getLeaderBoard = async (req: Request, res: Response) => {
  try {
    const contestId = Array.isArray(req.params.contestId) ? req.params.contestId[0] : req.params.contestId;
    const token = req.headers.authorization?.split(' ')[0];

    if (!token) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json(createErrorResponse("Token is missing"));
    }

    const JWT_SECRET = process.env.JWT_SECRET || "";
    const decodedPayload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const mcqPoints = await prismaClient.mcq_submissions.groupBy({by: ["user_id"], _sum: {points_earned: true}});
    const dsaPoints = await prismaClient.dsa_submissions.groupBy({by: ["user_id", "problem_id"], _max: {points_earned: true}});

    const dsaTotal: Record<string, number> = {};
    for(const row of dsaPoints){
      dsaTotal[row.user_id] =
        (dsaTotal[row.user_id] || 0) + (row._max.points_earned ?? 0);
    }

    const allUserIds = await prismaClient.users.findMany({select: {id: true, name: true}});

    const totalPoints: Record<string, number> = {};
    for (const user of allUserIds) {
      const uid = user.id;
      totalPoints[uid] =
        (dsaTotal[uid] ?? 0) +
        (mcqPoints.find((m) => m.user_id === uid)?._sum.points_earned ?? 0);
    }

    let finalRes: leaderBoardRow[] = [];

    for (const user of allUserIds) {
      finalRes.push({
        userId: user.id,
        name: user.name,
        totalPoints: totalPoints[user.id] ?? 0,
        rank: 0,
      });
    }

    finalRes.sort((a, b) => b.totalPoints - a.totalPoints);

    let rank = 0;
    let prevPoints: number | null = null;

    for (let i = 0; i < finalRes.length; i++) {
      if (finalRes[i].totalPoints !== prevPoints) {
        rank = i + 1;
        prevPoints = finalRes[i].totalPoints;
      }
      finalRes[i].rank = rank;
    }

    return res.status(StatusCode.OK).json(createSuccessResponse(finalRes));
  } catch (error: any) {
    logger.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(StatusCode.UNAUTHORIZED)
        .json(createErrorResponse("UNAUTHORIZED"));
    }
    return res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json(createErrorResponse("Error adding dsa problem to the contest"));
  }
}

export {
  createNewContest,
  getContestDetails,
  addMcqToContest,
  submitMcq,
  addDsaToContest,
  getLeaderBoard
};
