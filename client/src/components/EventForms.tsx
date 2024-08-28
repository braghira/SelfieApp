import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventSchema, EventType, client_log } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Loader from "./Loader";
import { useAuth } from "@/context/AuthContext";
import { useEvents } from "@/context/EventContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { isAxiosError } from "axios";

export default function EventForm() {
  const { dispatch } = useEvents();
  const { user } = useAuth();
  const private_api = useAxiosPrivate();

  const form = useForm<EventType>({
    resolver: zodResolver(EventSchema),
    defaultValues: {
      title: "",
      date: "",
      duration: 1,
      location: "",
      isRecurring: false,
      recurrencePattern: {
        frequency: undefined,
        endType: undefined,
        occurrences: 1,
        endDate: "",
      },
    },
  });

  async function onSubmit(event: EventType) {
    if (event.isRecurring && (!event.recurrencePattern?.frequency || !event.recurrencePattern?.endType ||
        (event.recurrencePattern.endType === 'after' && !event.recurrencePattern.occurrences) ||
        (event.recurrencePattern.endType === 'until' && !event.recurrencePattern.endDate))) {
      form.setError("recurrencePattern", {
        type: "manual",
        message: "You need to select frequency and End Type",
      });
      return;
    }

    if (!user) {
      form.setError("root.serverError", {
        type: "manual",
        message: "You must be logged in",
      });
      return;
    }

    try {
      const response = await private_api.post("/api/events", event);
      const parsed = EventSchema.safeParse(response.data);

      if (parsed.success) {
        dispatch({ type: "CREATE_EVENT", payload: [response.data] });
        client_log("new event added", response.data);
      } else {
        client_log("error while validating created event schema");
      }
    } catch (error) {
      if (isAxiosError(error)) client_log("an error occurred:" + error.message);
    }

    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 mt-4 w-[500px]">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Title of the event"
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
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Date</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  className="shad-input"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value.substring(0, 16));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Duration (h)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  className="shad-input"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.valueAsNumber);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Location</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Location of the event"
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
          name="isRecurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormLabel className="shad-form_label">Is Recurring</FormLabel>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('isRecurring') && (
          <>
            <FormField
              control={form.control}
              name="recurrencePattern.frequency"
              render={() => (
                <FormItem>
                  <FormLabel className="shad-form_label">Frequency</FormLabel>
                  <FormControl>
                    <Select onValueChange={(value) => form.setValue("recurrencePattern.frequency", value as "daily" | "weekly" | "monthly")}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recurrencePattern.endType"
              render={() => (
                <FormItem>
                  <FormLabel className="shad-form_label">End Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={(value) => form.setValue("recurrencePattern.endType", value as "after" | "until")}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select end type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="after">After N occurrences</SelectItem>
                          <SelectItem value="until">Until a specific date</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('recurrencePattern.endType') === 'after' && (
              <FormField
                control={form.control}
                name="recurrencePattern.occurrences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-form_label">Occurrences</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="shad-input"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.valueAsNumber);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch('recurrencePattern.endType') === 'until' && (
              <FormField
                control={form.control}
                name="recurrencePattern.endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-form_label">End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="shad-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}

        {form.formState.errors.root && (
          <FormMessage>{form.formState.errors.root.serverError?.message || form.formState.errors.root.validation?.message}</FormMessage>
        )}

        {form.formState.errors.recurrencePattern && (
          <FormMessage>{form.formState.errors.recurrencePattern.message}</FormMessage>
        )}

        <Button type="submit" className="shad-button_primary">
          {form.formState.isSubmitting ? <Loader /> : "Add Event"}
        </Button>
      </form>
    </Form>
  );
}
