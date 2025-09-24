import z from "zod";

export const formSchema = z.object({
  email: z.email(),
  password: z.string()
})

export type FormState = {
  message?: string;
  error?: string;
}
