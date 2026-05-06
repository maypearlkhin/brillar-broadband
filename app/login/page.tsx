import LoginForm from "@/components/LoginForm";

type LoginPageProps = {
  searchParams: {
    next?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return <LoginForm nextPath={searchParams.next} />;
}
