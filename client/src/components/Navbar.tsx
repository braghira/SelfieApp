import { NavLink } from "react-router-dom";
import { buttonVariants } from "./ui/button";
import Logo from "./Logo";
import { CalendarDays, HomeIcon, NotebookIcon, TimerIcon } from "lucide-react";
import SideSheet from "./SideSheet";
import TimeMachinePopup from "./TimeMachine";

export default function Navbar() {
  return (
    <nav>
      <div className="hidden fixed z-50 backface-visibility-hidden top-0 left-0 w-full h-[--navbar-h] md:flex justify-between items-center py-1 px-5 sm:bg-card sm:border-b">
        <NavLink to="/home">
          <Logo size="sm" />
        </NavLink>

        <div className="flex sm:justify-between sm:items-center sm:gap-5">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              isActive
                ? buttonVariants({ variant: "default" })
                : buttonVariants({ variant: "ghost" })
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/pomodoro"
            className={({ isActive }) =>
              isActive
                ? buttonVariants({ variant: "default" })
                : buttonVariants({ variant: "ghost" })
            }
          >
            Pomodoro
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              isActive
                ? buttonVariants({ variant: "default" })
                : buttonVariants({ variant: "ghost" })
            }
          >
            Calendar
          </NavLink>

          <NavLink
            to="/notes"
            className={({ isActive }) =>
              isActive
                ? buttonVariants({ variant: "default" })
                : buttonVariants({ variant: "ghost" })
            }
          >
            Notes
          </NavLink>
          <TimeMachinePopup />
        </div>

        <SideSheet />
      </div>

      {/* Bottom mobile navbar */}
      {/* Added backface-visibility-hidden for mozilla android cause of a fixed position not working, Chat GPT */}
      <div className="md:hidden flex h-12 fixed backface-visibility-hidden left-0 bottom-0 w-full p-1 bg-background justify-around items-end gap-5 z-50 border-t border-border">
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
        <TimeMachinePopup />
        <SideSheet />
      </div>
    </nav>
  );
}
