/*
  Warnings:

  - The `submitted_at` column on the `dsa_submissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "contests_creator_id_key";

-- AlterTable
ALTER TABLE "dsa_submissions" DROP COLUMN "submitted_at",
ADD COLUMN     "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "contests_creator_id_idx" ON "contests"("creator_id");

-- CreateIndex
CREATE INDEX "contests_start_time_end_time_idx" ON "contests"("start_time", "end_time");

-- CreateIndex
CREATE INDEX "dsa_problems_contest_id_idx" ON "dsa_problems"("contest_id");

-- CreateIndex
CREATE INDEX "dsa_submissions_user_id_idx" ON "dsa_submissions"("user_id");

-- CreateIndex
CREATE INDEX "dsa_submissions_problem_id_idx" ON "dsa_submissions"("problem_id");

-- CreateIndex
CREATE INDEX "mcq_questions_contest_id_idx" ON "mcq_questions"("contest_id");

-- CreateIndex
CREATE INDEX "mcq_submissions_user_id_idx" ON "mcq_submissions"("user_id");

-- CreateIndex
CREATE INDEX "mcq_submissions_question_id_idx" ON "mcq_submissions"("question_id");

-- CreateIndex
CREATE INDEX "test_cases_problem_id_idx" ON "test_cases"("problem_id");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "dsa_problems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
