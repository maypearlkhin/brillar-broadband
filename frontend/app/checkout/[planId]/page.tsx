import { Container } from "@mui/material";
import { notFound } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import SessionGreeting from "@/components/SessionGreeting";
import { axiosServer } from "@/lib/axiosServer";

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  params: {
    planId: string;
  };
};

type PlanPayload = {
  plan: {
    id: string;
    name: string;
    monthlyPrice: number;
    downloadSpeedMbps: number;
    features: string[];
  };
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  let payload: PlanPayload;

  try {
    const { data } = await axiosServer().get<PlanPayload>(
      `/api/plans/${encodeURIComponent(params.planId)}`
    );
    payload = data;
  } catch {
    notFound();
  }

  const plan = payload.plan;

  return (
    <>
      <Container maxWidth="lg" sx={{ pt: { xs: 2, sm: 3 } }}>
        <SessionGreeting />
      </Container>
      <CheckoutForm
        plan={{
          id: plan.id,
          name: plan.name,
          monthlyPrice: plan.monthlyPrice,
          downloadSpeedMbps: plan.downloadSpeedMbps,
          features: plan.features,
        }}
      />
    </>
  );
}
