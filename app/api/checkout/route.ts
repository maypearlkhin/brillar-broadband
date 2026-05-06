import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyJwt } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Plan from "@/lib/models/Plan";
import Subscription from "@/lib/models/Subscription";

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const currentUser = token ? verifyJwt(token) : null;

    if (!currentUser) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json({ message: "planId is required." }, { status: 400 });
    }

    await connectToDatabase();

    const plan = await Plan.findOne({ id: planId, isActive: true });

    if (!plan) {
      return NextResponse.json({ message: "Plan not found." }, { status: 404 });
    }

    const subscription = await Subscription.create({
      userId: currentUser.userId,
      planId: plan._id,
      status: "Pending Admin Approval"
    });

    return NextResponse.json(
      {
        message: "Purchase request submitted for admin approval.",
        subscription: {
          id: subscription._id,
          status: subscription.status,
          planId: plan.id
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkout error", error);
    return NextResponse.json({ message: "Unable to complete checkout." }, { status: 500 });
  }
}
