import { createFileRoute, Navigate, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/shared/setup")({
  component: AdminSetup,
});

function AdminSetup() {
  const user = useQuery(api.auth.getCurrentUser);
  const setCurrentUserRole = useMutation(api.auth.setCurrentUserRole);
  const { role } = useSearch({ from: "/shared/setup" }) as { role: "admin" | "user" };
  const navigate = useNavigate();
  const hasSetRole = useRef(false);

  useEffect(() => {
    // Wait for user to be loaded
    if (user === undefined) return;
    
    // If user is null (not authenticated), redirect to home
    if (user === null) {
      navigate({ to: "/", replace: true });
      return;
    }

    // Only set role once
    if (hasSetRole.current) return;
    console.log("Setting role:", role);
    hasSetRole.current = true;
    
    setCurrentUserRole({ role })
      .then(() => {
        console.log("Role set successfully:", role);
        // Navigate to appropriate dashboard based on role
        if (role === "admin") {
          navigate({ to: "/admin/dashboard", replace: true });
        } else {
          navigate({ to: "/dashboard", replace: true });
        }
      })
      .catch((error) => {
        console.error("Failed to set role:", error);
        hasSetRole.current = false; // Allow retry on error
      });
  }, [user, setCurrentUserRole, role, navigate]);

  // Show loading state while user is being fetched
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // If user is null (not authenticated), show message briefly before redirect
  if (user === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Fallback: if we reach here, show loading (shouldn't happen)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing setup...</p>
      </div>
    </div>
  );
}
