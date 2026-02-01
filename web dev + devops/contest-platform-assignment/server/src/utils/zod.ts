import  * as z from "zod";

const signupSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(["creator", "contestee"]).default('contestee'),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6)
});

const constestCreateSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime()
});

const addMcqToContestSchema = z.object({
  questionText: z.string(),
  options: z.array(z.string()).optional(),
  correctOptionIndex: z.number().int(),
  points: z.number()
});

const submitMcqSchema = z.object({
  selectedOptionIndex: z.number().int()
});

const testCasesSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean(),
});

const addDsaToContestSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()).optional(),
  points: z.number().int(),
  timeLimit: z.number(),
  memoryLimit: z.number(),
  testCases: z.array(testCasesSchema)
});

export {
  signupSchema,
  loginSchema,
  constestCreateSchema,
  addMcqToContestSchema,
  submitMcqSchema,
  addDsaToContestSchema,
};