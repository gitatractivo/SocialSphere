import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Head from "next/head";
import SideNav from "~/components/SideNav";
import { useRouter } from "next/router";


const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  const isEnterRoute = router.pathname === "/enter";
  return (
    <SessionProvider session={session}>
      <Head>
        <title>SocialSphere</title>
        <meta
          name="description"
          content="This is a basic social media application with chat functionality"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto flex items-start gap-0 justify-center sm:pr-4">
        {isEnterRoute ? null : <SideNav />}
        <div className="mx-auto min-h-screen  flex-grow border-x">
          <Component {...pageProps} />
        </div>
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
