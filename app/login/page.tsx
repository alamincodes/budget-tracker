import LoginForm from "../../components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="relative z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
