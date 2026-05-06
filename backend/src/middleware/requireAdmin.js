import { getTokenFromRequest, verifyJwt } from "../auth.js";

export function requireAdmin(req, res, next) {
  const token = getTokenFromRequest(req);
  const user = token ? verifyJwt(token) : null;

  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  next();
}
