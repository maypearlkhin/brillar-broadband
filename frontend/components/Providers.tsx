"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

/** Saturated rose-pink — flat fills, stronger chroma than the washed palette. */
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#ec4899",
      dark: "#be185d",
      light: "#fce7f3",
      contrastText: "#ffffff"
    },
    secondary: {
      main: "#38bdf8",
      light: "#7dd3fc",
      dark: "#0369a1"
    },
    success: {
      main: "#059669"
    },
    warning: {
      main: "#d97706"
    },
    info: {
      main: "#0284c7"
    },
    background: {
      default: "#fdf2f8",
      paper: "#ffffff"
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569"
    },
    divider: "rgba(236, 72, 153, 0.26)"
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: "-0.02em"
    },
    h5: {
      fontWeight: 600
    },
    h6: {
      fontWeight: 600
    },
    subtitle1: {
      fontWeight: 600
    },
    button: {
      fontWeight: 600,
      textTransform: "none"
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          "&:hover": { boxShadow: "0 2px 12px rgba(219, 39, 119, 0.32)" }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)",
          border: "1px solid rgba(236, 72, 153, 0.22)"
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: "rgba(236, 72, 153, 0.16)",
          borderColor: "rgba(190, 24, 93, 0.35)"
        }
      }
    }
  }
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
