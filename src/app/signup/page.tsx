'use client';
import { signUp } from "./action";
import { type FormState } from './schema';
import { useActionState } from "react";

const initialState = {};

export default function SignUp() {
  const [state, formAction, pending] = useActionState<FormState>(signUp, initialState);

  return (
    <div>
      <form action={formAction}>
        <input type="text" id="email" name="email" placeholder="email" />
        <input type="password" id="password" name="password" placeholder="password " />
        <button disabled={pending}>Submit</button>
        {state?.error}
        {state?.message}
      </form>
    </div>
  )
}
