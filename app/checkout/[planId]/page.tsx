import { notFound } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { connectToDatabase } from "@/lib/db";
import Plan from "@/lib/models/Plan";

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  params: {
    planId: string;
  };
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  await connectToDatabase();

  const plan = await Plan.findOne({ id: params.planId, isActive: true }).lean();

  if (!plan) {
    notFound();
  }

  return (
    <CheckoutForm
      plan={{
        id: plan.id,
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        downloadSpeedMbps: plan.downloadSpeedMbps,
        features: plan.features
      }}
    />
  );
}
