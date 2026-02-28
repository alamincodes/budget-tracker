import LoginForm from "@/components/Auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background">
      <div className="absolute inset-0 bg-grid-pattern opacity-50" aria-hidden />
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10" aria-hidden />
      <div className="relative z-10 w-full px-4">
        <LoginForm />
      </div>
    </div>
  );
}
