import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { useAuth0 } from "@auth0/auth0-react";
import { createUserSchema, Person } from "@hkrecruitment/shared";

export const SignupForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<Person>>({
    resolver: joiResolver(createUserSchema),
  });
  const onSubmit = (data: Partial<Person>) => console.log(data);
  const user = useAuth0().user!!;

  return (
    <div 
      // stack all the inputs vertically, reset previous styles
      style={{ display: "flex", flexDirection: "column", margin: 0, padding: 0 }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("firstName")} />
        <input {...register("lastName")} />
        <input {...register("sex")} />
        <input
          {...register("email", {
            value: user.email!!, // email for current auth0 user
            disabled: true,
          })}
        />
        <input {...register("phone_no")} />
        <input {...register("telegramId")} />
        <input type="submit" />
      </form>
    </div>
  );
};
