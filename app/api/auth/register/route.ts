import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import { isValidServiceZone } from "@/lib/serviceZones";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, serviceZone } = body;

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { message: "Email and a password of at least 6 characters are required." },
        { status: 400 }
      );
    }

    if (!isValidServiceZone(serviceZone)) {
      return NextResponse.json(
        { message: "Please choose one of Brillar Broadband's supported service zones." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account already exists for this email." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      serviceZone,
      role: "customer"
    });

    return NextResponse.json({
      message: "Account created. Please log in to continue.",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        serviceZone: user.serviceZone
      }
    });
  } catch (error) {
    console.error("Register error", error);
    return NextResponse.json({ message: "Unable to register right now." }, { status: 500 });
  }
}
