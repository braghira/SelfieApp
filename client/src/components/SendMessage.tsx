import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { UserType } from "@/lib/utils";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import usePushNotification, {
  NotificationPayload,
} from "@/hooks/usePushNotification";
import { useAuth } from "@/context/AuthContext";
import { PomodoroType } from "@/hooks/useTimer";
import Loader from "@/components/Loader";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const FormSchema = z.object({
  message: z.string().max(30, {
    message: "Message must not be longer than 30 characters.",
  }),
});

export default function SendMessage() {
  const [open, setOpen] = useState(false);
  const [fetchedUsers, setFetchedUsers] = useState<UserType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const { RequestPushSub, sendNotification, sendLoading } =
    usePushNotification();
  const { user: ME } = useAuth();
  const private_api = useAxiosPrivate();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

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

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    let parsed_timer: PomodoroType | null = null;

    const storage = localStorage.getItem("pomodoro_timer");

    if (storage) {
      parsed_timer = JSON.parse(storage);

      if (parsed_timer) {
        // Send Pomodoro Notification
        const payload: NotificationPayload = {
          title: `Message from: ${ME?.username}`,
          body: data.message,
          url: "/home",
        };

        selectedUsers.map((user) => {
          const userID = user?._id;
          userID && RequestPushSub(() => sendNotification(userID, payload));
        });
      }
    }
  };

  useEffect(() => {
    if (!open) {
      setFetchedUsers([]);
      setSelectedUsers([]);
    }
  }, [open]);

  return (
    <>
      <Button
        className="rounded-full"
        onClick={() => {
          setOpen(true);
        }}
      >
        <SendIcon />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Input
          placeholder="Send to user..."
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

        <div className="flex-center m-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-2/3 space-y-6 text-center"
            >
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Write your message here"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-1/3">
                {sendLoading ? <Loader /> : <SendIcon />}
              </Button>
            </form>
          </Form>
        </div>
      </CommandDialog>
    </>
  );
}
