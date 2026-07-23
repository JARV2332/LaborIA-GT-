import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { LaborProvider } from "@/context/LaborContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LaborProvider>
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0f172a" />
      </Head>
      <Component {...pageProps} />
    </LaborProvider>
  );
}
