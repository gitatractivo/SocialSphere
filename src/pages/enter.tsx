import React, { useEffect } from "react";
import Image from "next/image";
import AuthForm from "~/components/auth/AuthForm";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import UserNameImageInput from "~/components/auth/UserNameImageInput";
import { NextPageContext } from "next";
import DarkSwitch from "~/components/DarkSwitch";
import classNames from "classnames";

export default function Enter() {
  const router = useRouter();
  const session = useSession();
  useEffect(() => {
    if (
      session?.status === "authenticated" &&
      !!session?.data?.user.username &&
      !!session?.data?.user.image
    ) {
      void router.push("/");
    }
  }, [session?.status, session?.data?.user.username, router]);
  console.log(session);
  return (
    <div
      className="
        min-w-screen 
        transition-color 
        box-border
        flex 
        min-h-screen 
        flex-col 
        items-center
        justify-center
        bg-gray-100 
        py-12 
        duration-300
        dark:bg-gray-800
        sm:px-6
        lg:px-8
      "
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* <Image
          height="48"
          width="48"
          className="mx-auto w-auto"
          src="/images/logo.png"
          alt="Logo"
        /> */}
        <h2
          className="
            transition-color 
            text-center 
            text-3xl 
            font-bold 
            tracking-tight
            text-gray-900
            duration-300
            ease-out
            dark:text-white
          "
        >
          {session.status === "authenticated"
            ? "Enter Username"
            : "Log In/ Sign Up to Continue..."}
        </h2>
      </div>
      {session.status === "authenticated" ? (
        <UserNameImageInput />
      ) : (
        <AuthForm />
      )}

      <div className="absolute top-10 right-10 drop-shadow-[0_0px_35px_rgba(0,0,0,0.7)] dark:drop-shadow-[0_0_35px_rgba(255,255,255,0.7)]">
        <DarkSwitch  />
      </div>
    </div>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  return {
    props: {
      session,
    },
  };
}
