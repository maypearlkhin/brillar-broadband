import { Container } from "@mui/material";
import { notFound } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import SessionGreeting from "@/components/SessionGreeting";

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  params: {
    planId: string;
  };
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const api = (process.env.BACKEND_URL ?? "http://127.0.0.1:4000").replace(/\/$/, "");
  const response = await fetch(`${api}/api/plans/${params.planId}`, {
    cache: "no-store"
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    notFound();
  }

  const payload = (await response.json()) as {
    plan: {
      id: string;
      name: string;
      monthlyPrice: number;
      downloadSpeedMbps: number;
      features: string[];
    };
  };

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
