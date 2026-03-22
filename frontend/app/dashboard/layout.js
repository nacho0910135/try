import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute roles={["agent", "owner", "admin"]}>
      <div className="app-shell section-pad grid gap-6 lg:grid-cols-[280px_1fr]">
        <DashboardSidebar />
        <div className="space-y-6">{children}</div>
      </div>
    </ProtectedRoute>
  );
}

