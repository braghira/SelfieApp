import ical from "ical"
import { useForm } from "react-hook-form";
import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventSchema, EventType, client_log } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
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
import Loader from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import { useEvents } from "@/context/EventContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { isAxiosError } from "axios";
import moment from 'moment';
import UserFinder from "@/components/UserFinder";


export default function EventForm() {
  const { dispatch, events } = useEvents();
  const { user } = useAuth();
  const private_api = useAxiosPrivate();
  const fileInputRef = useRef<HTMLInputElement>(null);


  const form = useForm<EventType>({
    resolver: zodResolver(EventSchema),
    defaultValues: {
      title: "",
      date: "",
      duration: 1,
      location: "",
      isRecurring: false,
      itsPomodoro: false,
      groupList: [],
      author: user?.username || "",
      recurrencePattern: {
        frequency: undefined,
        endType: undefined,
        occurrences: 1,
        endDate: "",
      },
      pomodoro:{
        initStudy: 30,
        initRelax: 5,
        cycles: 5,
      },
    },
  });

  async function onSubmit(event: EventType) {
    if (
      event.isRecurring &&
      (!event.recurrencePattern?.frequency || 
        !event.recurrencePattern?.endType ||
        (event.recurrencePattern.endType === "after" &&
          !event.recurrencePattern.occurrences) ||
        (event.recurrencePattern.endType === "until" &&
          !event.recurrencePattern.endDate))
    ) {
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
    if (event.author !== user.username) {
      form.setError("root.serverError", {
        type: "Unauthorized",
        message: "You are not authorized to create this activity.",
      });
      return;
    }

    if (event.itsPomodoro) {
      const pomodoroExists = events.some(e => e.itsPomodoro && moment(e.date).format('YYYY-MM-DD') === moment(event.date).format('YYYY-MM-DD')); 
      if (pomodoroExists) {
        form.setError("root.serverError", {
          type: "manual",
          message: "You cannot create more than one Pomodoro event.",
        });
        return;
      }
      else if (event.pomodoro) {
        event.pomodoro.initStudy = (event.pomodoro.initStudy ?? 30) * 60000;
        event.pomodoro.initRelax = (event.pomodoro.initRelax ?? 5) * 60000;
      }
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
  

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = reader.result as string;
        const parsedData = ical.parseICS(data);

        Object.values(parsedData).forEach((component) => {
          if (component.type === 'VEVENT') {
            const startDate = component.start ? new Date(component.start) : new Date();
            const endDate = component.end ? new Date(component.end) : new Date(startDate.getTime() + 60 * 60 * 1000); // Default to 1 hour if end is not defined
            let endT: "after" | "until" | undefined;
            let untilDate;
            
            let freq: "daily" | "weekly" | "monthly" | undefined;
            if (component.rrule?.options.freq === 1) {
              freq = "monthly";
            }
            else if(component.rrule?.options.freq === 2){
              freq = "weekly";
            }
            else if(component.rrule?.options.freq === 3){
              freq = "daily";
            }
            else {
              freq = undefined;
            }
            console.log(component)
            let occurrences: number | undefined;
            if (component.rrule && component.rrule.options.count) {
              endT = "after";
              occurrences = component.rrule.options.count;
            } else {
              endT = "until";
              occurrences = 1;
            }
            if(component.rrule && component.rrule.options.until instanceof Date){
              untilDate = new Date(component.rrule.options.until);
            }
            else{
              untilDate = undefined;
            }
            
            console.log(freq, occurrences, component.endDate);
            form.setValue("title", component.summary || "");
            form.setValue("date", startDate.toISOString().substring(0, 16));
            form.setValue("duration", (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
            form.setValue("location", component.location || "");
            form.setValue("isRecurring", !!component.rrule);
            form.setValue("itsPomodoro", false); 
            form.setValue("groupList", []);
            form.setValue("author", user?.username || "");
            form.setValue("recurrencePattern.frequency", freq);
            form.setValue("recurrencePattern.endType", endT);
            form.setValue("recurrencePattern.occurrences", occurrences);
            form.setValue("recurrencePattern.endDate", undefined);
            form.setValue("pomodoro.initStudy", 30);
            form.setValue("pomodoro.initRelax", 5);
            form.setValue("pomodoro.cycles", 5);
          }
        });
      } catch (error) {
        console.error("Error parsing ICS file:", error);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  }


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2 mt-4 w-full max-w-sm md:max-w-md"
      >
        
        {/* Campi normali dell'evento */}
        <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mt-2">
              Importa un evento:
          </div>
        <Input
          type="file"
          accept=".ics"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="shad-input"
        />
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
          name="itsPomodoro"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormLabel className="shad-form_label">It's Pomodoro</FormLabel>
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

{form.watch("itsPomodoro") && (
          <>
            <FormField
              control={form.control}
              name="pomodoro.initStudy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Study Time (m)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Study time (m)"
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
              name="pomodoro.initRelax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relax Time (m)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Relax time (m)"
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
              name="pomodoro.cycles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Cycles</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Number of cycles"
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
          </>
        )}

        {/* Altri campi normali del form */}
        {!form.watch("itsPomodoro") && (
          <>
            {/* Duration */}
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

            {/* Location */}
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

            {/* Recurring */}
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

            {form.watch("isRecurring") && (
              <>
                <FormField
                  control={form.control}
                  name="recurrencePattern.frequency"
                  render={() => (
                    <FormItem>
                      <FormLabel className="shad-form_label">Frequency</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) =>
                            form.setValue(
                              "recurrencePattern.frequency",
                              value as "daily" | "weekly" | "monthly"
                            )
                          }
                        >
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
                        <Select
                          onValueChange={(value) =>
                            form.setValue(
                              "recurrencePattern.endType",
                              value as "after" | "until"
                            )
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select end type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="after">
                                After N occurrences
                              </SelectItem>
                              <SelectItem value="until">
                                Until a specific date
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("recurrencePattern.endType") === "after" && (
                  <FormField
                    control={form.control}
                    name="recurrencePattern.occurrences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="shad-form_label">
                          Occurrences
                        </FormLabel>
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

                {form.watch("recurrencePattern.endType") === "until" && (
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
          </>
        )}

        <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mt-2">
              Aggiungi utente:
        </div>
        <UserFinder 
          onUserSelect={(username: string) => {
            // Aggiungi l'username selezionato a specificAccess se non è già presente
            if (!form.getValues("groupList").includes(username)) {
              form.setValue("groupList", [...form.getValues("groupList"), username]);
            }
          }}
        />

            {/* Visualizza gli utenti con accesso specifico */}
        <div className="mt-4">
          {form.getValues("groupList").map((username, index) => (
              <span key={index} className="inline-block bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 px-3 py-1 rounded-lg mr-2 mb-2">
                {username}
              </span>
            ))}
        </div>
            

        {form.formState.errors.root && (
          <FormMessage>
            {form.formState.errors.root.serverError?.message ||
              form.formState.errors.root.validation?.message}
          </FormMessage>
        )}

        {form.formState.errors.recurrencePattern && (
          <FormMessage>
            {form.formState.errors.recurrencePattern.message}
          </FormMessage>
        )}

        <Button type="submit" className="shad-button_primary">
          {form.formState.isSubmitting ? <Loader /> : "Add Event"}
        </Button>
      </form>
    </Form>
  );
}
