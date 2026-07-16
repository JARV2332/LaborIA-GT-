import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { LaborProvider } from "@/context/LaborContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LaborProvider>
      <Component {...pageProps} />
    </LaborProvider>
  );
}
