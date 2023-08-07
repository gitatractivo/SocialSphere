import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { loginSchema } from "~/utils/types";
import { ILogin } from "../utils/types";
import { Button } from "./Button";
import Input from "./Input";
import { constants } from "crypto";

const SignIn = ({
  isLoading,
  setIsLoading,
}: {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}) => {
  const router = useRouter();
  const session = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ILogin>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true);
    const data = {
      email: watch("email") as string | undefined,
      password: watch("password") as string | undefined,
    };
    // if(!data.password || !data.usernameOrEmail){
    //   alert("Email Password Required")

    // }
     const resp = await signIn("credentials", {
       ...data,
       redirect: false,
     });
     console.log("resp",resp)
     if(resp?.ok){

       router.push('/')  
     }
     

    

    
      
  };

  return (
    <form className="space-y-6" onSubmit={(e) => void onSubmit(e)}>
      <Input
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        id="email"
        label="Email or UserName"
      />
      <Input
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        id="password"
        label="Password"
        type="password"
      />

      <div>
        <Button disabled={isLoading} fullWidth type="submit">
          {"LOGIN"}
        </Button>
      </div>
    </form>
  );
};

export default SignIn;