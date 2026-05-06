import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Plan from "@/lib/models/Plan";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectToDatabase();

  const plans = await Plan.find({ isActive: true }).sort({ monthlyPrice: 1 }).lean();

  return NextResponse.json({
    plans: plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice,
      downloadSpeedMbps: plan.downloadSpeedMbps,
      features: plan.features,
      isActive: plan.isActive
    }))
  });
}
