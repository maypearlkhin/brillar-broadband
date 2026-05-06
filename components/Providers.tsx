"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#b44cc1"
    },
    secondary: {
      main: "#ff7a1a"
    },
    background: {
      default: "#fbfaf2",
      paper: "#ffffff"
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: 0
    },
    h2: {
      fontWeight: 800,
      letterSpacing: 0
    },
    h4: {
      fontWeight: 750,
      letterSpacing: 0
    },
    button: {
      fontWeight: 700,
      textTransform: "none"
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8
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
