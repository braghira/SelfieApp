import { NavLink } from "react-router-dom";
import { ModeToggle } from "./ModeToggle";
import { Button, buttonVariants } from "./ui/button";
import useLogout from "@/hooks/useLogout";
import Logo from "./Logo";
import ProfilePhoto from "./ProfilePhoto";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Navbar() {
  const { logout } = useLogout();

  return (
    <nav className="flex justify-between items-center">
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger>
            <Menu />
          </SheetTrigger>
          <SheetContent className="w-[250px]" side={"left"}>
            <SheetHeader className="flex flex-col items-start">
              <SheetTitle>Views Menu</SheetTitle>
            </SheetHeader>

            <NavLink
              to="/pomodoro"
              className={buttonVariants({ variant: "link" })}
            >
              pomodoro
            </NavLink>

            <ProfilePhoto />

            <Button variant={"ghost"} onClick={() => logout()}>
              Logout
            </Button>
          </SheetContent>
        </Sheet>
      </div>
      <NavLink to="/home">
        <Logo />
      </NavLink>
      <div className="hidden sm:flex sm:justify-between sm:items-center">
        <NavLink
          to="/pomodoro"
          className={buttonVariants({ variant: "ghost" })}
        >
          pomodoro
        </NavLink>

        <ProfilePhoto />

        <Button variant={"ghost"} onClick={() => logout()}>
          Logout
        </Button>
      </div>
      <ModeToggle />
    </nav>
  );
}
