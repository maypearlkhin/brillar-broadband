import bcrypt from "bcryptjs";
import { getTokenFromRequest, verifyJwt } from "../../auth.js";
import User from "../../models/userModel.js";

function getCurrentUser(req) {
  const token = getTokenFromRequest(req);
  return token ? verifyJwt(token) : null;
}

export async function listUsers(req, res) {
  const currentUser = getCurrentUser(req);
  if (!currentUser || currentUser.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  const users = await User.find({})
    .sort({ createdAt: -1 })
    .select("-passwordHash")
    .lean();

  return res.json({ success: true, data: users });
}

export async function inviteIspTeam(req, res) {
  const currentUser = getCurrentUser(req);
  if (!currentUser || currentUser.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({
      message: "Name, email, and a password of at least 6 characters are required.",
    });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role: "isp_team",
    // No serviceZone needed for ISP team
  });

  return res.status(201).json({
    success: true,
    message: "ISP team member account created.",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

export async function removeUser(req, res) {
  const currentUser = getCurrentUser(req);
  if (!currentUser || currentUser.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  const { id } = req.params;

  if (id === currentUser.userId) {
    return res.status(400).json({ message: "You cannot remove your own account." });
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  return res.json({ success: true, message: "User removed." });
}
