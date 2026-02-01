-- AddForeignKey
ALTER TABLE "mcq_submissions" ADD CONSTRAINT "mcq_submissions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "mcq_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
