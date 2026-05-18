import type { Metadata } from "next";
import { Box } from "@mui/material";
import { PublicEnvScript } from "next-runtime-env";
import Providers from "@/components/Providers";
import AppHeader from "@/components/AppHeader";
import { getCurrentUserFromCookies } from "@/lib/auth";
import DynamicIframeLoader from "@/components/DynamicIframeLoader";

export const metadata: Metadata = {
  title: "Brillar Broadband",
  description: "Residential fibre broadband — plans, account, and service status"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUserFromCookies();

  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
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
