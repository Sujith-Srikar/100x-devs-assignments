/*
  Warnings:

  - The `submitted_at` column on the `mcq_submissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "mcq_submissions" DROP COLUMN "submitted_at",
ADD COLUMN     "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
