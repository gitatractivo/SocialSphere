import { Html, Main, NextScript ,Head} from "next/document";


export default function Document() {
  return (
    <Html>
      <Head>
        <title>SocialSphere</title>
        <meta
          name="description"
          content="This is a basic social media application with chat functionality"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
