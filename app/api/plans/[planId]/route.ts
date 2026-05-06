import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Plan from "@/lib/models/Plan";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    planId: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  await connectToDatabase();

  const plan = await Plan.findOne({ id: params.planId, isActive: true }).lean();

  if (!plan) {
    return NextResponse.json({ message: "Plan not found." }, { status: 404 });
  }

  return NextResponse.json({
    plan: {
      id: plan.id,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice,
      downloadSpeedMbps: plan.downloadSpeedMbps,
      features: plan.features,
      isActive: plan.isActive
    }
  });
}
