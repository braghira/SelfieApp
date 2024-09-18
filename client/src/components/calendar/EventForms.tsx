import ical from "ical";
import { useForm } from "react-hook-form";
import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventSchema, EventType } from "@/lib/utils";
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
import { UserType } from "@/lib/utils";
import UsersSearchBar from "@/components/UsersSearchBar";
import moment from "moment";
import useEventsApi from "@/hooks/useEventsApi";

export default function EventForm() {
  const { events } = useEvents();
  const { postEvent } = useEventsApi();
  const { user } = useAuth();
  const [userList, setUsersList] = useState<UserType[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      recurrencePattern: {
        frequency: undefined,
        endType: undefined,
        occurrences: 1,
        endDate: "",
      },
      expectedPomodoro: {
        study: 30,
        relax: 5,
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

    // check if pomodoro event for today already exists
    if (event.itsPomodoro) {
      const pomodoroExists = events.some(
        (e) =>
          e.itsPomodoro &&
          moment(e.date).format("YYYY-MM-DD") ===
            moment(event.date).format("YYYY-MM-DD")
      );
      if (pomodoroExists) {
        form.setError("root.serverError", {
          type: "manual",
          message: "You cannot create more than one Pomodoro event.",
        });
        return;
      } else if (event.expectedPomodoro) {
        // if the expected pomodoro has been created, update the currPomodoro field
        event.currPomodoro = event.expectedPomodoro;
      }
    }

    postEvent(event);

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
          if (component.type === "VEVENT") {
            const startDate = component.start
              ? new Date(component.start)
              : new Date();
            const endDate = component.end
              ? new Date(component.end)
              : new Date(startDate.getTime() + 60 * 60 * 1000); // Default to 1 hour if end is not defined

            const event: EventType = {
              title: component.summary || "",
              date: startDate.toISOString(),
              duration: (endDate.getTime() - startDate.getTime()) / 60000,
              location: component.location,
              isRecurring: !!component.recurrenceRule,
              //aggiungo i miei valori di default
              itsPomodoro: false,
              recurrencePattern: {
                frequency: undefined,
                endType: undefined,
                occurrences: 1,
                endDate: "",
              },
              expectedPomodoro: {
                study: 30,
                relax: 5,
                cycles: 5,
              },
            };
            form.reset(event);
          }
        });
      } catch (error) {
        console.error("Error parsing ICS file:", error);
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
              name="expectedPomodoro.study"
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
              name="expectedPomodoro.relax"
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
              name="expectedPomodoro.cycles"
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
                  <FormLabel className="shad-form_label">
                    Duration (h)
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
                  <FormLabel className="shad-form_label">
                    Is Recurring
                  </FormLabel>
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

            <UsersSearchBar userList={userList} setUsersList={setUsersList} />

            {/* Recurring Details */}
            {form.watch("isRecurring") && (
              <>
                {/* Frequency */}
                <FormField
                  control={form.control}
                  name="recurrencePattern.frequency"
                  render={() => (
                    <FormItem>
                      <FormLabel className="shad-form_label">
                        Frequency
                      </FormLabel>
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

                {/* End Type */}
                <FormField
                  control={form.control}
                  name="recurrencePattern.endType"
                  render={() => (
                    <FormItem>
                      <FormLabel className="shad-form_label">
                        End Type
                      </FormLabel>
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
                        <FormLabel className="shad-form_label">
                          End Date
                        </FormLabel>
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
