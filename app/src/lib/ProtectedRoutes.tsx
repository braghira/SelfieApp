import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuthContext from "@/hooks/useAuthContext";

export default function ProtectedRoutes({ children }: PropsWithChildren) {
  const { user } = useAuthContext();
  const location = useLocation();

  // useEffect(() => {
  //   if (!loading && user === undefined) {
  //     navigate("/login", { replace: true });
  //   }
  // }, [user, loading, navigate]);

  return user == undefined ? (
    <Navigate to="/login" state={{ from: location }} replace></Navigate>
  ) : (
    <>{children}</>
  );

  // render the protected route
  // return <>{children}</>;
}
