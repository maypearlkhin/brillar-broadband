import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyJwt } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Subscription from "@/lib/models/Subscription";

export const dynamic = "force-dynamic";

async function requireAdmin(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const currentUser = token ? verifyJwt(token) : null;

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  return currentUser;
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (!admin) {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  await connectToDatabase();

  const subscriptions = await Subscription.find()
    .sort({ createdAt: -1 })
    .populate("userId")
    .populate("planId")
    .lean();

  return NextResponse.json({ subscriptions });
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (!admin) {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  const { subscriptionId, action } = await request.json();

  if (!subscriptionId || !["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { message: "subscriptionId and a valid action are required." },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const status = action === "approve" ? "Installation Approved" : "Rejected";
  const subscription = await Subscription.findByIdAndUpdate(
    subscriptionId,
    { status },
    { new: true }
  );

  if (!subscription) {
    return NextResponse.json({ message: "Subscription not found." }, { status: 404 });
  }

  return NextResponse.json({
    message: `Subscription ${action === "approve" ? "approved" : "rejected"}.`,
    subscription: {
      id: subscription._id,
      status: subscription.status
    }
  });
}
