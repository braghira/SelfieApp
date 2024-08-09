import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// types
import { EventSchema, EventType, client_log } from "@/lib/utils";
// components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, 
        SelectContent,
        SelectGroup,
        SelectItem,
        SelectTrigger,
        SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
      resolver: zodResolver(EventSchema), // Utilizzando Zod per la validazione
      defaultValues: {
        title: "",
        date: "",
        duration: 1,
        location: "",
        isRecurring: false,
        recurrencePattern: {
          frequency: 'daily',
          endType: 'never',
          occurrences: 1,
          endDate: "",
        },
      },
    });
  
    async function onSubmit(event: EventType) {
      if (!user) {
        form.setError("root.serverError", {
          type: "You must be logged in",
        });
        return;
      }
  
      try {
        const response = await private_api.post("/api/events", event);
           // Controlliamo che lo schema sia corretto con zod
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 mt-4">
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
                <FormLabel className="shad-form_label">Duration</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="shad-input"
                    placeholder="Duration in hours"
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
            <FormItem>
                    <FormLabel className="shad-form_label">Frequency</FormLabel>
                    <FormControl>
                        <Select>
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
                  
                  <FormItem>
                    <FormLabel className="shad-form_label">End Type</FormLabel>
                    <FormControl>
                    <Select>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select end" />
                        </SelectTrigger>
                            <SelectContent>
                            <SelectGroup>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="after">After N occurrences</SelectItem>
                        <SelectItem value="until">Until a specific date</SelectItem>
                        </SelectGroup>
                        </SelectContent>
                    </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
            <FormMessage>{form.formState.errors.root.serverError.type}</FormMessage>
          )}
          <Button type="submit" className="shad-button_primary">
            {form.formState.isSubmitting ? <Loader /> : "Add Event"}
          </Button>
        </form>
      </Form>
    );
  }
  