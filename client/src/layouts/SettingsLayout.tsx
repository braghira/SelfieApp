import { NavLink, Outlet } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SettingsLayout() {
  return (
    <div className="settings-container">
      <div className="flex flex-col space-y-8 lg:space-y-0 lg:flex-row w-full">
        <aside className="lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:w-full">
            <NavLink
              to="profile"
              className={({ isActive }) =>
                cn(
                  buttonVariants({ variant: "ghost" }),
                  isActive
                    ? "bg-muted hover:bg-muted"
                    : "hover:bg-transparent hover:underline",
                  "justify-start"
                )
              }
            >
              Profile
            </NavLink>

            <NavLink
              to="account"
              className={({ isActive }) =>
                cn(
                  buttonVariants({ variant: "ghost" }),
                  isActive
                    ? "bg-muted hover:bg-muted"
                    : "hover:bg-transparent hover:underline",
                  "justify-start"
                )
              }
            >
              Account
            </NavLink>

            <NavLink
              to="takeaselfie"
              className={({ isActive }) =>
                cn(
                  buttonVariants({ variant: "ghost" }),
                  isActive
                    ? "bg-muted hover:bg-muted"
                    : "hover:bg-transparent hover:underline",
                  "justify-start"
                )
              }
            >
              Take a Selfie
            </NavLink>
          </nav>
        </aside>

        <div className="lg:w-4/5 lg:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
