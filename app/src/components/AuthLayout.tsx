import { Outlet, Navigate } from "react-router-dom";

export default function AuthLayout() {
  const isAuthenticated: boolean = false;

  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <>
          <section>
            <Outlet />
          </section>
        </>
      )}
    </>
  );
}
