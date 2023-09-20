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
  console.log(session)
  const [variant, setVariant] = useState<Variant>("LOGIN");
  const [isLoading, setIsLoading] = useState(false);

  const toggleVariant = useCallback(() => {
    if (variant === "LOGIN") {
      setVariant("REGISTER");
    } else {
      setVariant("LOGIN");
    }
  }, [variant]);

  const socialAction = (action: string) => {
    setIsLoading(true);

    signIn(action, { redirect: false })
      .then((callback) => {
        if (callback?.error) {
          // toast.error("Invalid credentials!");
          alert("Invalid");
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
        transition-color
        bg-white
        px-4
        py-8
        shadow-xl
        shadow-gray-700/50
        duration-300
        ease-out
        dark:bg-gray-300
        dark:shadow-xl
        dark:shadow-gray-400/40 
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
              <div
                className="transition-color w-full border-t border-gray-300 duration-300             
                ease-out 
                dark:border-t-2
                dark:border-white"
              />
            </div>
            <div className="relative flex justify-center text-sm">
              <span
                className="transition-color bg-white px-2 text-gray-500 duration-300 
                ease-out
                dark:bg-gray-300"
              >
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
          <button onClick={toggleVariant} className="cursor-pointer underline text-md font-bold outline-none border-none">
            {variant === "LOGIN" ? "Create an account" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
