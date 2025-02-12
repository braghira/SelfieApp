import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// types
import { ActivitySchema, ActivityType, client_log } from "@/lib/utils";
// components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import { useActivities } from "@/context/ActivityContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import Loader from "../Loader";
import { isAxiosError } from "axios";
import UserFinder from "@/components/UserFinder";

export default function ActivityForm() {
  const { dispatch } = useActivities();
  const { user } = useAuth();
  const private_api = useAxiosPrivate();

  const form = useForm<ActivityType>({
    resolver: zodResolver(ActivitySchema),
    defaultValues: {
      title: "",
      endDate: "",
      groupList: [],
      completed: false,
      author: user?.username || "",
    },
  });

  async function onSubmit(activity: ActivityType) {
    if (!user) {
      form.setError("root.serverError", {
        type: "You must be logged in",
      });
      return;
    }
    if (activity.author !== user.username) {
      form.setError("root.serverError", {
        type: "Unauthorized",
        message: "You are not authorized to create this activity.",
      });
      return;
    }
    try {
      const response = await private_api.post("/api/activities", activity);
      // Controlliamo che lo schema sia corretto con zod
      const parsed = ActivitySchema.safeParse(response.data);

      if (parsed.success) {
        dispatch({ type: "CREATE_ACTIVITY", payload: [response.data] });
        client_log("new activity added", response.data);
      } else {
        client_log("error while validating created activity schema");
      }
    } catch (error) {
      if (isAxiosError(error)) client_log("an error occurred:" + error.message);
    }
    //{userList[0]._id}
    form.reset();
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-2 mt-2 w-full max-w-sm md:max-w-md"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Title of the activity"
                    className="shad-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">End Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="shad-input"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mt-2">
            Aggiungi utente:
          </div>
          <UserFinder
            onUserSelect={(username: string) => {
              // Aggiungi l'username selezionato a specificAccess se non è già presente
              if (!form.getValues("groupList").includes(username)) {
                form.setValue("groupList", [
                  ...form.getValues("groupList"),
                  username,
                ]);
              }
            }}
          />

          {/* Visualizza gli utenti con accesso specifico */}
          <div className="mt-4">
            {form.getValues("groupList").map((username, index) => (
              <span
                key={index}
                className="inline-block bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 px-3 py-1 rounded-lg mr-2 mb-2"
              >
                {username}
              </span>
            ))}
          </div>

          <Button type="submit" className="shad-button_primary">
            {form.formState.isSubmitting ? <Loader /> : "Add Activity"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
