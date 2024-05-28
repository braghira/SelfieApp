import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthContext from "@/hooks/useAuthContext";
// import { Skeleton } from "@/components/ui/skeleton";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoutes({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user === undefined) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  // if (loading) {
  //   // Render a loading indicator while checking for authentication
  //   return (
  //     <div className="container flex-center absolute">
  //       <Skeleton className="h-[75vh] w-[90vw] rounded-xl" />
  //       <div className="space-y-2">
  //         <Skeleton className="h-4 w-[250px]" />
  //         <Skeleton className="h-4 w-[200px]" />
  //       </div>
  //     </div>
  //   );
  // }
  // render the protected route
  return <>{children}</>;
}
