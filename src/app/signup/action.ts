'use server';

import { auth } from "@/lib/server/auth";
import { formSchema, FormState } from "./schema";
import z from "zod";

export async function signUp(prevState: FormState, formData: FormData): Promise<FormState> {
  const validated = formSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (validated.error) return {
    error: z.treeifyError(validated.error).errors.join("; "),
  }

  const { token } = await auth.api.signUpEmail({
    body: {
      name: "John Doe",
      email: validated.data.email,
      password: validated.data.password
    },
  });
  console.log(token);

  return token ? {
    message: 'Successfully signed up.'
  } : {
    error: 'Invalid data submitted.'
  }
}
