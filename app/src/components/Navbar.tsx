import { NavLink } from "react-router-dom";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";
import useLogout from "@/hooks/useLogout";

export default function Navbar() {
  const { logout } = useLogout();

  const handleClick = () => {
    logout();
  };

  return (
    <header className="p-10">
      <div className="flex-between">
        <NavLink to="/">
          <h1> Workout Buddy</h1>
        </NavLink>
        <ModeToggle />

        <Button variant={"ghost"}>
          <NavLink to="/login">Login</NavLink>
        </Button>
        <Button variant={"ghost"} onClick={handleClick}>
          Logout
        </Button>
      </div>
    </header>
  );
}
