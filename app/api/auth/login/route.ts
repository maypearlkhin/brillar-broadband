import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { authCookieOptions, signJwt } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    const token = signJwt({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    const response = NextResponse.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        serviceZone: user.serviceZone
      }
    });

    response.cookies.set({ ...authCookieOptions(), value: token });

    return response;
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json({ message: "Unable to log in right now." }, { status: 500 });
  }
}
