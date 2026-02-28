import BottomNav from "@/components/ui/bottom-nav";
import { AppMenu } from "@/components/ui/app-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppMenu />
      {children}
      <BottomNav />
    </>
  );
}
