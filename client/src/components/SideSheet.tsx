import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ProfilePhoto from "./ProfilePhoto";
import { ModeToggle } from "./dashboard/ModeToggle";
import { Button } from "./ui/button";
import useLogout from "@/hooks/useLogout";
import { useAuth } from "@/context/AuthContext";
import usePushNotification from "@/hooks/usePushNotification";
import { useNavigate } from "react-router-dom";

export default function SideSheet() {
  const { logout } = useLogout();
  usePushNotification();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Sheet>
      <SheetTrigger>
        <ProfilePhoto />
      </SheetTrigger>

      <SheetContent className="w-60 sm:w-[20rem]" side={"right"}>
        <SheetHeader className="mb-5">
          <SheetTitle className="flex flex-column items-center gap-1">
            {`${user?.name} ${user?.surname}`}
          </SheetTitle>

          <SheetDescription>{user?.username}</SheetDescription>
        </SheetHeader>

        <div className="h-full flex flex-col items-start justify-between">
          <div className="w-full flex flex-col items-start gap-2">
            <Button
              variant="link"
              className="w-full justify-start border-b-2 border-primary rounded-none"
              onClick={() => navigate("/settings/profile")}
            >
              Profile
            </Button>

            <Button
              variant="link"
              className="w-full justify-start border-b-2 border-primary rounded-none"
              onClick={() => navigate("/settings/account")}
            >
              Account
            </Button>

            <Button
              variant="link"
              className="w-full justify-start border-b-2 border-primary rounded-none"
              onClick={() => navigate("/settings/takeaselfie")}
            >
              Take a Selfie
            </Button>
          </div>

          <div className="flex w-full items-center justify-between mb-20">
            <Button className="" variant="destructive" onClick={() => logout()}>
              Logout
            </Button>

            <ModeToggle isIcon={true} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
