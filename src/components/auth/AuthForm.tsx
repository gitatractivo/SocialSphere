
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { BsDiscord, BsGoogle } from "react-icons/bs";
import AuthSocialButton from "./AuthSocialButton";
import SignUp from "./SIgnUp";
import SignIn from "./SignIn";


type Variant = "LOGIN" | "REGISTER";


export default function AuthForm() {
  const session = useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>("LOGIN");
  const [isLoading, setIsLoading] = useState(false);

  

  const toggleVariant = useCallback(() => {
    if (variant === "LOGIN") {
      setVariant("REGISTER");
    } else {
      setVariant("LOGIN");
    }
  }, [variant]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const socialAction = (action: string) => {
  setIsLoading(true);

  signIn(action, { redirect: false })
    .then((callback) => {
      if (callback?.error) {
        // toast.error("Invalid credentials!");
        alert("Invalid")
      }

      if (
        callback?.ok &&
        !!session?.data?.user.username &&
        !!session?.data?.user.image
      ) {
        router.push("/");
      }
    })
    .finally(() => setIsLoading(false));
}; 
 

 
 

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div
        className="
        bg-white
          px-4
          py-8
          shadow
          sm:rounded-lg
          sm:px-10
        "
      >
        {variant === "LOGIN" ? (
          <SignIn isLoading={isLoading} setIsLoading={setIsLoading} />
        ) : (
          <SignUp isLoading={isLoading} setIsLoading={setIsLoading} />
        )}

        <div className="mt-6">
          <div className="relative">
            <div
              className="
                absolute 
                inset-0 
                flex 
                items-center
              "
            >
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <AuthSocialButton
              icon={BsDiscord}
              onClick={() => socialAction("discord")}
            />
            <AuthSocialButton
              icon={BsGoogle}
              onClick={() => socialAction("google")}
            />
          </div>
        </div>
        <div
          className="
            mt-6 
            flex 
            justify-center 
            gap-2 
            px-2 
            text-sm 
            text-gray-500
          "
        >
          <div>
            {variant === "LOGIN"
              ? "New to Messenger?"
              : "Already have an account?"}
          </div>
          <div onClick={toggleVariant} className="cursor-pointer underline">
            {variant === "LOGIN" ? "Create an account" : "Login"}
          </div>
        </div>
      </div>
    </div>
  );
}
