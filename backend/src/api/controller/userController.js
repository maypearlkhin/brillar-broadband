import bcrypt from "bcryptjs";
import { signJwt } from "../../auth.js";
import ServiceZone from "../../models/serviceZoneModel.js";
import User from "../../models/userModel.js";

export async function register(req, res) {
  try {
    const { name, email, password, serviceZone, phone } = req.body;
    const fullName = typeof name === "string" ? name.trim() : "";

    if (!fullName || fullName.length < 2 || fullName.length > 80) {
      return res.status(400).json({
        message: "Please enter your full name (2–80 characters)."
      });
    }

    if (!email || !password || password.length < 6) {
      return res.status(400).json({
        message: "Email and a password of at least 6 characters are required."
      });
    }

    if (!serviceZone?.country || !serviceZone?.district || !serviceZone?.postalCode) {
      return res.status(400).json({
        message: "A valid service zone must be selected."
      });
    }

    const allowed = await ServiceZone.findOne({
      country: serviceZone.country,
      district: serviceZone.district,
      postalCode: serviceZone.postalCode
    }).lean();

    if (!allowed) {
      return res.status(400).json({
        message: "Please choose one of Brillar Broadband's supported service zones."
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        message: "An account already exists for this email."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: fullName,
      email,
      passwordHash,
      phone: typeof phone === "string" ? phone.trim() : "",
      serviceZone: {
        country: serviceZone.country,
        district: serviceZone.district,
        postalCode: serviceZone.postalCode
      },
      role: "customer"
    });

    return res.json({
      message: "Account created. Please log in to continue.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        serviceZone: user.serviceZone
      }
    });
  } catch (error) {
    console.error("Register error", error);
    return res.status(500).json({ message: "Unable to register right now." });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signJwt({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name || ""
    });

    /* Token is returned in the body; the client stores it in a JS cookie on its own
       origin and sends it back as `Authorization: Bearer …`. */
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name || "",
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        serviceZone: user.serviceZone
      }
    });
  } catch (error) {
    console.error("Login error", error);
    return res.status(500).json({ message: "Unable to log in right now." });
  }
}

export async function logout(_req, res) {
  /* Logout is client-driven: the browser deletes its own cookie. JWTs are stateless
     so there's nothing to revoke server-side in this demo. */
  return res.json({ message: "Logged out." });
}
