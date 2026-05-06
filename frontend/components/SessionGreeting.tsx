import { Typography } from "@mui/material";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { userGreetingLine } from "@/lib/userGreeting";

/** First-name style greeting for page body only — session actions stay in `NavActions`. */
export default function SessionGreeting() {
  const user = getCurrentUserFromCookies();

  if (!user) {
    return null;
  }

  return (
    <Typography component="p" variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: "text.primary", mt: 0 }}>
      {userGreetingLine(user)}
    </Typography>
  );
}
