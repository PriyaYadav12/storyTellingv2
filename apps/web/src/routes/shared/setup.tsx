import { createFileRoute, Navigate, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { useEffect } from "react";

export const Route = createFileRoute("/shared/setup")({
  component: AdminSetup,
});

function AdminSetup() {
  const user = useQuery(api.auth.getCurrentUser);
  const setCurrentUserAdmin = useMutation(api.auth.setCurrentUserAdmin);
  const { role } = useSearch({ from: "/shared/setup" }) as { role: "admin" | "user" };
  console.log("role:", role);
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) return;
    setCurrentUserAdmin({ role })
        .then(() => {
          console.log("Admin role set successfully");
          if (role === "admin") {
            navigate({ to: "/admin/dashboard", replace: true });
          } else {
            navigate({ to: "/dashboard", replace: true });
          }
        })
        .catch((error) => {
          console.error("Failed to set admin role:", error);
        });
  }, [user, setCurrentUserAdmin, role, navigate]);

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up admin account...</p>
        </div>
      </div>
    );
  }

  return <Navigate to="/admin/dashboard" replace />;
}
