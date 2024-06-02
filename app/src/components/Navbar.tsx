import { NavLink } from "react-router-dom";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";
import useLogout from "@/hooks/useLogout";
import Logo from "./Logo";

export default function Navbar() {
  const { logout } = useLogout();

  const handleClick = () => {
    logout();
  };

  return (
    <nav>
      <div className="flex-between">
        <NavLink to="/">
          <Logo />
        </NavLink>
        <ModeToggle />

        <Button variant={"ghost"} onClick={handleClick}>
          Logout
        </Button>
      </div>
    </nav>
  );
}
