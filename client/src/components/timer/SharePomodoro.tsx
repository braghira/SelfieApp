import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { SendIcon, Share2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { UserType } from "@/lib/utils";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import usePushNotification, {
  NotificationPayload,
} from "@/hooks/usePushNotification";
import Loader from "../Loader";
import { useAuth } from "@/context/AuthContext";
import { PomodoroType } from "@/hooks/useTimer";

export default function SharePomodoro() {
  const [open, setOpen] = useState(false);
  const [fetchedUsers, setFetchedUsers] = useState<UserType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const { RequestPushSub, sendNotification, sendLoading } =
    usePushNotification();
  const { user: ME } = useAuth();
  const private_api = useAxiosPrivate();

  // GET matching users for easy search
  function onChange(value: string) {
    private_api
      .get(`/api/users/${value}`)
      .then((response) => {
        if (response.status === 200) {
          const USERS: UserType[] = response.data;

          // Filtra per escludere l'utente corrente (ME)
          const filteredUsers = USERS.filter(
            (user) => user.username !== ME?.username
          );

          setFetchedUsers(filteredUsers);
        }
      })
      .catch(() => {
        setFetchedUsers([]);
        console.error("Couldn't fetch matching users");
      });
  }

  function onSelect(value: string) {
    console.log(value);
    private_api
      .get(`/api/users/single/${value}`)
      .then((response) => {
        if (response.status === 200) {
          const userExists = selectedUsers.some(
            (user) => user._id === response.data._id
          );

          if (!userExists) {
            setSelectedUsers([...selectedUsers, response.data]);
          }
        }
      })
      .catch(() => {
        console.error("Couldn't fetch matching users");
      });
  }

  useEffect(() => {
    if (!open) {
      setFetchedUsers([]);
      setSelectedUsers([]);
    }
  }, [open]);

  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        <Share2Icon />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Input
          placeholder="Share with user..."
          className="w-4/5 m-2"
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Found Users">
            {fetchedUsers.map((user) => (
              <CommandItem
                value={user.username}
                onSelect={(value) => {
                  onSelect(value);
                }}
              >
                <span className="font-bold mr-1">{user.username}</span> (
                {user.name} {user.surname})
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        <CommandSeparator />

        <div className="grid grid-cols-4 gap-2 m-1">
          {selectedUsers.map((user) => (
            <Badge className="flex-center">{user.username}</Badge>
          ))}
        </div>

        <div className="flex-center h-[100px]">
          <Button
            className="w-1/3"
            onClick={() => {
              let parsed_timer: PomodoroType | null = null;

              const storage = localStorage.getItem("pomodoro_timer");

              if (storage) {
                parsed_timer = JSON.parse(storage);

                if (parsed_timer) {
                  // Send Pomodoro Notification
                  const payload: NotificationPayload = {
                    title: "Study with my Pomodoro!",
                    body: `From: ${ME?.username}`,
                    url: "/pomodoro",
                    pomodoro: parsed_timer,
                  };

                  selectedUsers.map((user) => {
                    const userID = user?._id;
                    userID &&
                      RequestPushSub(() => sendNotification(userID, payload));
                  });
                }
              }
            }}
          >
            {sendLoading ? <Loader /> : <SendIcon />}
          </Button>
        </div>
      </CommandDialog>
    </>
  );
}
