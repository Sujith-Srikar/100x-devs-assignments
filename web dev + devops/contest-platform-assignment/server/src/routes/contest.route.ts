import express from "express";
import { validate } from "../middlewares/validation.middleware";
import {
  constestCreateSchema,
  addMcqToContestSchema,
  submitMcqSchema,
  addDsaToContestSchema,
} from "../utils/zod";
import {
  createNewContest,
  getContestDetails,
  addMcqToContest,
  submitMcq,
  addDsaToContest,
  getLeaderBoard,
} from "../controllers/contest.controller";

const router = express.Router();
router.post("/", validate(constestCreateSchema), createNewContest);
router.get("/:contestId", getContestDetails);
router.post(
  "/:contestId/mcq",
  validate(addMcqToContestSchema),
  addMcqToContest,
);
router.post(
  "/:contestId/mcq/:questionId/submit",
  validate(submitMcqSchema),
  submitMcq,
);
router.post("/:contestId/dsa", validate(addDsaToContestSchema), addDsaToContest);
router.get("/:contestId/leaderboard", getLeaderBoard);

export default router;
