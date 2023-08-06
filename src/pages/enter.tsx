import React, { useEffect } from "react";
import Image from "next/image";
import AuthForm from "~/components/AuthForm";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import UserNameImageInput from "~/components/UserNameImageInput";
import { NextPageContext } from "next";

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
  console.log(session)
  return (
    <div
      className="
        box-border 
        flex 
        min-h-screen 
        flex-col 
        justify-center 
        bg-gray-100 
        py-12 
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
            text-center 
            text-3xl 
            font-bold 
            tracking-tight 
            text-gray-900
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
