import { NavLink } from "react-router-dom";
import { ModeToggle } from "./ModeToggle";
import { Button, buttonVariants } from "./ui/button";
import useLogout from "@/hooks/useLogout";
import Logo from "./Logo";
import ProfilePhoto from "./ProfilePhoto";

export default function Navbar() {
  const { logout } = useLogout();

  return (
    <nav>
      <div className="flex-between">
        <NavLink to="/home">
          <Logo />
        </NavLink>

        <NavLink
          to="/pomodoro"
          className={buttonVariants({ variant: "ghost" })}
        >
          pomodoro
        </NavLink>

        <ModeToggle />

        <ProfilePhoto />

        <Button variant={"ghost"} onClick={() => logout()}>
          Logout
        </Button>
      </div>
    </nav>
  );
}
