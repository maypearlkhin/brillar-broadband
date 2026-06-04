/** Default signed-in home for header / nav (safe for client and server). */
export function getAccountHomePath(role: string | undefined): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "isp_team") return "/isp/dashboard";
  return "/dashboard";
}
