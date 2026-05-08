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
  searchParams: {
    term?: string;
  };
};

type PlanPayload = {
  plan: {
    id: string;
    name: string;
    monthlyPrice: number;
    downloadSpeedMbps: number;
    price90Days?: number;
    price180Days?: number;
    price365Days?: number;
    features: string[];
  };
};

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
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
      <Container maxWidth="lg" sx={{ pt: { xs: 1, sm: 1.5 }, "& p": { mb: 0.5 } }}>
        <SessionGreeting />
      </Container>
      <CheckoutForm
        plan={{
          id: plan.id,
          name: plan.name,
          monthlyPrice: plan.monthlyPrice,
          downloadSpeedMbps: plan.downloadSpeedMbps,
          price90Days: plan.price90Days,
          price180Days: plan.price180Days,
          price365Days: plan.price365Days,
          features: plan.features,
        }}
        selectedTerm={searchParams.term}
      />
    </>
  );
}
