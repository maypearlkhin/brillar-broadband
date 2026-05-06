import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyJwt } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Subscription from "@/lib/models/Subscription";
import User from "@/lib/models/User";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const currentUser = token ? verifyJwt(token) : null;

  if (!currentUser) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  await connectToDatabase();

  const [user, subscriptions] = await Promise.all([
    User.findById(currentUser.userId).lean(),
    Subscription.find({ userId: currentUser.userId })
      .sort({ createdAt: -1 })
      .populate("planId")
      .lean()
  ]);

  return NextResponse.json({
    user: user
      ? {
          id: user._id,
          email: user.email,
          role: user.role,
          serviceZone: user.serviceZone
        }
      : null,
    subscription: subscriptions[0] || null,
    subscriptions
  });
}
