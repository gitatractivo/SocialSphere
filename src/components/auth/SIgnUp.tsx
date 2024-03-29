import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useForm
} from "react-hook-form";
import { api } from "~/utils/api";
import { ISignUp, signUpSchema } from "~/utils/types";
import { Button } from "../Button";
import Input from "../Input";


export const AVAILABLE = [true, false, "Loading", null] as const;

const SignUp = ({
  isLoading,
  setIsLoading,
}: {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}) => {
  const [available, setAvailable] = useState<(typeof AVAILABLE)[number]>(null);
  const router = useRouter();
  const session = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ISignUp>({
    resolver: zodResolver(signUpSchema),
  });

  
 const username = watch("username");

 // Call useQuery directly inside the component
 const resp = api.profile.findUsernameExists.useQuery({username});

 useEffect(() => {
   if (!username) {
     setAvailable(null);
     return;
   }

   username && setAvailable("Loading");

   // Assuming resp.data.result contains the property usernameAvailable
  //  console.log(resp.data,username,"resp")
  //  if(!resp.data) return;
   resp.data && username && setAvailable(resp.data?.result.usernameAvailable);
 }, [username, resp]);



  const { mutateAsync, mutate } = api.profile.createUser.useMutation();
  const onSubmit= async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
      const email= watch("email")
      const password=  watch("password")
      const passwordConfirmation=  watch("passwordConfirmation")
      const name = watch("name");
      
      if (available !== true) {
        // Show an alert or handle the case where the username is not available
        alert("Username is not available.");
        return;
      }
      const result = await mutateAsync({email,username,password,name,passwordConfirmation});
      if (result.status === 201) {
        signIn("credentials", {
          email,
          password,
          redirect: false,
        })
          .then((callback) => {
            if (callback?.error) {
              alert("Invalid");
            }

            if (
              callback?.ok &&
              !!session?.data?.user.username &&
              !!session?.data?.user.image
            ) {
              // router.push("/enter");
            }
          })
          .finally(() => setIsLoading(false));
      }
    }
    

  
  return (
    <form className="space-y-4" onSubmit={(e)=>void onSubmit(e)}>
      <Input
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        id="name"
        label="Full Name"
        type="text"
      />
      <Input
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        id="username"
        label="Username "
        type="text"
        available={available}
      />
      <Input
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        id="email"
        label="Email "
        type="email"
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
      <Input
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        id="passwordConfirmation"
        label="Confirm Password"
        type="password"
      />

      <div>
        <Button disabled={isLoading} fullWidth type="submit">
          {"SIGNUP"}
        </Button>
      </div>
    </form>
  );
};

export default SignUp;
