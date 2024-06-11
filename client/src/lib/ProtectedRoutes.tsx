import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuthContext from "@/hooks/useAuthContext";

export default function ProtectedRoutes({ children }: PropsWithChildren) {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  // controlla che il contesto abbia finito di aggiornarsi
  if (user === undefined && !loading) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
