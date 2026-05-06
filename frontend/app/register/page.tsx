import RegisterForm from "@/components/RegisterForm";

type RegisterPageProps = {
  searchParams: {
    planId?: string;
    next?: string;
  };
};

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  return (
    <RegisterForm
      nextPath={searchParams.next || (searchParams.planId ? `/checkout/${searchParams.planId}` : "/plans")}
    />
  );
}
