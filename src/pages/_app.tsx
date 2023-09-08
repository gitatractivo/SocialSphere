import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Head from "next/head";
import SideNav from "~/components/SideNav";
import { useRouter } from "next/router";
import { ThemeProvider } from "next-themes";


const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  const isEnterRoute = router.pathname === "/enter";


  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class">
        
        <div className="container mx-auto flex w-fit items-start justify-center gap-0 sm:pr-4">
          {isEnterRoute ? null : <SideNav />}
          <div className=" min-h-screen w-fit max-w-[1000px]  flex-grow border-x">
            <Component {...pageProps} />
          </div>
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
