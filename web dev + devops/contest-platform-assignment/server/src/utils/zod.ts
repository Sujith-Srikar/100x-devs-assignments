import  * as z from "zod";

const signupSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(["creator", "contestee"]).default('contestee'),
});

export {signupSchema}