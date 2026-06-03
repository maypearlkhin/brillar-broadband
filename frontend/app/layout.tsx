// frontend/app/layout.tsx
import type { Metadata } from "next";
import { Box } from "@mui/material";
import { PublicEnvScript } from "next-runtime-env";
import Providers from "@/components/Providers";
import AppHeader from "@/components/AppHeader";
import { getCurrentUserFromCookies } from "@/lib/auth";
import DynamicIframeLoader from "@/components/DynamicIframeLoader";
import PwaRegistrar from "@/components/PwaRegistrar"; // Import the new PWA script

export const metadata: Metadata = {
  title: "Brillar Broadband",
  description: "Residential fibre broadband — plans, account, and service status",
  manifest: "/manifest.json", // Next.js native way to inject the manifest link
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUserFromCookies();

  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
      </head>
      <body>
        {/* Safely registers the service worker on the client side */}
        <PwaRegistrar /> 
        
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