import type { Metadata } from "next";
import { Box } from "@mui/material";
import Providers from "@/components/Providers";
import AppHeader from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "Brillar Broadband",
  description: "Residential fibre broadband — plans, account, and service status"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppHeader />
          <Box component="main">{children}</Box>
        </Providers>
      </body>
    </html>
  );
}
