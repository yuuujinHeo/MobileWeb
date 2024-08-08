"use client";
import { LayoutProvider } from "../layout/context/layoutcontext";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "../styles/layout/layout.scss";
import "../styles/components/components.scss";
import { Provider } from "react-redux";
import { GlobalUserProvider } from "../interface/user";
import {store} from "@/store/store";
import { useEffect } from "react";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          id="theme-css"
          href={`/themes/lara-light-indigo/theme.css`}
          rel="stylesheet"
        ></link>
      </head>
      <body>
        {/* <Provider store={store}> */}
          <PrimeReactProvider>
            <GlobalUserProvider>
              <LayoutProvider>{children}</LayoutProvider>
            </GlobalUserProvider>
          </PrimeReactProvider>
        {/* </Provider>  */}
      </body>
    </html>
  );
}
