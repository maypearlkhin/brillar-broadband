import type { Metadata } from "next";
import { Box } from "@mui/material";
import { PublicEnvScript } from "next-runtime-env";
import Providers from "@/components/Providers";
import AppHeader from "@/components/AppHeader";
import { getCurrentUserFromCookies } from "@/lib/auth";
import DynamicIframeLoader from "@/components/DynamicIframeLoader";

export const metadata: Metadata = {
  title: "Brillar Broadband",
  description: "Residential fibre broadband — plans, account, and service status",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Broadband"
  },
  themeColor: "#0D1B32"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUserFromCookies();

  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0D1B32" />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js');}`,
          }}
        />
      </head>
      <body>
        <Providers>
          <AppHeader />
          <Box component="main">{children}</Box>
          {(!user || user.role === "customer") && (
            <DynamicIframeLoader postLogin={!!user} />
          )}
        </Providers>
      </body>
    </html>
  );
}
