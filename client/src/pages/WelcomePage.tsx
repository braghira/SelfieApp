import Logo from "@/components/Logo";
import { ModeToggle } from "@/components/dashboard/ModeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { NavLink } from "react-router-dom";

export default function WelcomePage() {
  const { user } = useAuth();

  return (
    <div className="container flex flex-col justify-between gap-10 min-h-screen">
      <div className="flex justify-end w-full py-7">
        <ModeToggle isIcon={true} />
      </div>
      <div className="flex flex-col items-center justify-center h-full gap-10 my-10">
        <div className="flex flex-col items-center gap-10 xl:mb-10">
          <Logo size="lg" className="animate-slide-from-left" />
          <h1 className="animate-slide-from-right">Welcome to Selfie!</h1>
        </div>
        <div className="text-center w-full max-w-sm">
          {user === undefined ? (
            <h3 className="my-3">
              To use the app, first{" "}
              <span className="base-semibold">Log in</span> as a user
            </h3>
          ) : (
            <h3 className="my-3">Please continue to the app</h3>
          )}

          {/* Se l'utente è già loggato non mostrare i pulsanti per l'autenticazione  */}
          {user === undefined ? (
            <div className="flex flex-col items-center xl:flex-row xl:justify-center gap-3">
              <Button asChild className="w-full">
                <NavLink to="/login">Login</NavLink>
              </Button>
              Or
              <Button asChild className="w-full">
                <NavLink to="/signup">Signup</NavLink>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center xl:flex-row xl:justify-center gap-3">
              <Button asChild className="w-full">
                <NavLink to="/home">Home</NavLink>
              </Button>
            </div>
          )}
        </div>
      </div>
      <footer className="tiny-medium mb-1 text-center">
        Logo has been provided by{" "}
        <NavLink to={"https://hotpot.ai/art-generator"}>
          hotpot.ai/art-generator
        </NavLink>
      </footer>
    </div>
  );
}
