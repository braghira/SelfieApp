import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ProfilePhoto from "./ProfilePhoto";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";
import useLogout from "@/hooks/useLogout";
import { useAuth } from "@/context/AuthContext";
import Loader from "./Loader";
import { Bell } from "lucide-react";
import usePushNotification from "@/hooks/usePushNotification";
import { usePushContext } from "@/context/NotificationContext";
import { useNavigate } from "react-router-dom";

export default function SideSheet() {
  const { logout } = useLogout();
  const { RequestPushSub, subscribe, unsubscribe, subLoading, unsubLoading } =
    usePushNotification();
  const { user } = useAuth();
  const { subscription } = usePushContext();
  const navigate = useNavigate();

  return (
    <Sheet>
      <SheetTrigger>
        <ProfilePhoto />
      </SheetTrigger>

      <SheetContent className="w-60 sm:w-[20rem]" side={"right"}>
        <SheetHeader className="mb-5">
          <SheetTitle>{`${user?.name} ${user?.surname}`}</SheetTitle>
          <SheetDescription>
            <Button
              variant="link"
              onClick={() => navigate("/editprofile")}
            >
              Change account settings
            </Button>
          </SheetDescription>
        </SheetHeader>

        <div className="h-full flex flex-col items-start justify-between">
          <div className="flex flex-col items-start gap-2">
            <ModeToggle isIcon={false} />

            {subscription ? (
              <Button
                disabled={unsubLoading}
                className="bg-blue-900 hover:bg-blue-800"
                onClick={() => {
                  if (user?._id) unsubscribe(user?._id);
                }}
              >
                {unsubLoading ? (
                  <Loader />
                ) : (
                  <div className="flex gap-1">
                    <Bell /> Unsubscribe
                  </div>
                )}
              </Button>
            ) : (
              <Button
                disabled={subLoading}
                className="bg-blue-900 hover:bg-blue-800"
                onClick={async () => {
                  if (user?._id) RequestPushSub(() => subscribe(user._id));
                }}
              >
                {subLoading ? (
                  <Loader />
                ) : (
                  <div className="flex gap-1">
                    <Bell /> Subscribe
                  </div>
                )}
              </Button>
            )}
          </div>

          <Button
            className="mb-20"
            variant="destructive"
            onClick={() => logout()}
          >
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
