import { NavLink } from "react-router-dom";
import { ModeToggle } from "./ModeToggle";
import { Button, buttonVariants } from "./ui/button";
import useLogout from "@/hooks/useLogout";
import Logo from "./Logo";
import ProfilePhoto from "./ProfilePhoto";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CalendarDays, HomeIcon, NotebookIcon, TimerIcon } from "lucide-react";

export default function Navbar() {
  const { logout } = useLogout();

  return (
    <nav>
      <div className="hidden fixed z-50 backface-visibility-hidden top-0 left-0 w-full h-[--navbar-h] sm:flex justify-between items-center py-1 px-5 sm:bg-card sm:border-b">
        <NavLink to="/home">
          <Logo size="sm" />
        </NavLink>

        <div className="flex sm:justify-between sm:items-center sm:gap-5">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              [
                isActive
                  ? buttonVariants({ variant: "default" })
                  : buttonVariants({ variant: "ghost" }),
              ].join(" ")
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/pomodoro"
            className={({ isActive }) =>
              [
                isActive
                  ? buttonVariants({ variant: "default" })
                  : buttonVariants({ variant: "ghost" }),
              ].join(" ")
            }
          >
            Pomodoro
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              [
                isActive
                  ? buttonVariants({ variant: "default" })
                  : buttonVariants({ variant: "ghost" }),
              ].join(" ")
            }
          >
            Calendar
          </NavLink>

          <NavLink
            to="/notes"
            className={({ isActive }) =>
              [
                isActive
                  ? buttonVariants({ variant: "default" })
                  : buttonVariants({ variant: "ghost" }),
              ].join(" ")
            }
          >
            Notes
          </NavLink>
        </div>

        <Sheet>
          <SheetTrigger>
            <ProfilePhoto />
          </SheetTrigger>
          <SheetContent className="w-60 sm:w-[20rem]" side={"right"}>
            <SheetTitle className="flex-start mb-5">
              <SheetTitle>Account settings</SheetTitle>
            </SheetTitle>

            <div className="h-full flex flex-col items-start justify-between">
              <div className="flex flex-col items-start gap-2">
                <ModeToggle isIcon={false} />
                <Button variant="ghost">Set Birthday</Button>
              </div>

              <Button
                className="mb-12"
                variant="destructive"
                onClick={() => logout()}
              >
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Bottom mobile navbar */}
      {/* Added backface-visibility-hidden for mozilla android cause of a fixed position not working, Chat GPT */}
      <div className="hidden max-[640px]:flex h-12 fixed backface-visibility-hidden left-0 bottom-0 w-full p-1 bg-background justify-around items-end gap-5 z-50 border-t border-border">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            [
              isActive
                ? buttonVariants({ variant: "default", size: "icon" })
                : buttonVariants({ variant: "ghost", size: "icon" }),
            ].join(" ")
          }
        >
          <HomeIcon />
        </NavLink>

        <NavLink
          to="/pomodoro"
          className={({ isActive }) =>
            [
              isActive
                ? buttonVariants({ variant: "default", size: "icon" })
                : buttonVariants({ variant: "ghost", size: "icon" }),
            ].join(" ")
          }
        >
          <TimerIcon />
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            [
              isActive
                ? buttonVariants({ variant: "default", size: "icon" })
                : buttonVariants({ variant: "ghost", size: "icon" }),
            ].join(" ")
          }
        >
          <CalendarDays />
        </NavLink>

        <NavLink
          to="/notes"
          className={({ isActive }) =>
            [
              isActive
                ? buttonVariants({ variant: "default", size: "icon" })
                : buttonVariants({ variant: "ghost", size: "icon" }),
            ].join(" ")
          }
        >
          <NotebookIcon />
        </NavLink>

        <Sheet>
          <SheetTrigger>
            <ProfilePhoto />
          </SheetTrigger>
          <SheetContent className="w-60 sm:w-[20rem]" side={"right"}>
            <SheetHeader className="mb-5">
              <SheetTitle>Account settings</SheetTitle>
            </SheetHeader>

            <div className="h-full flex flex-col items-start justify-between">
              <div className="flex flex-col items-start gap-2">
                <ModeToggle isIcon={false} />

                <Button variant="ghost">Set Birthday</Button>
              </div>

              <Button
                className="mb-12"
                variant="destructive"
                onClick={() => logout()}
              >
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
