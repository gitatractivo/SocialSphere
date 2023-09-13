import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Head from "next/head";
import SideNav from "~/components/SideNav";
import { useRouter } from "next/router";
import { ThemeProvider } from "next-themes";
import clsx from "clsx";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  const isEnterRoute = router.pathname === "/enter";

  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class">
        <Toaster position="top-center" reverseOrder={false} />
        <div
          className={clsx(
            "mx-auto flex w-screen items-start  justify-center gap-0 lg:justify-center",
            isEnterRoute ? "" : " mx-auto "
          )}
        >
          {!isEnterRoute && (
            <div className="box-border hidden w-[88px] sm:flex xl:w-[275px]">
              {isEnterRoute ? null : <SideNav />}
            </div>
          )}
          <div
            className={clsx(
              "min-h-screen grow  ",
              !isEnterRoute &&
                " box-border w-full  sm:w-[calc(100vw-88px)] sm:max-w-[600px] lg:max-w-[1000px] xl:w-[calc(100vw-275px)]  "
            )}
          >
            <Component {...pageProps} />
          </div>
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
