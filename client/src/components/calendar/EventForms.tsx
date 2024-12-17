import ical from "ical";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { client_log, EventSchema, EventType } from "@/lib/utils";
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
import useEventsApi from "@/hooks/useEventsApi";
import UserFinder from "@/components/UserFinder";
import { PomodoroType, TimerType } from "@/hooks/useTimer";
import { Badge } from "@/components/ui/badge";

export default function EventForm() {
  const { postEvent } = useEventsApi();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [session, setSession] = useState<PomodoroType[]>([]);
  const [selectedTimer, setSelectedTimer] = useState<PomodoroType | null>(null);

  const form = useForm<EventType>({
    resolver: zodResolver(EventSchema),
    defaultValues: {
      title: "",
      date: "",
      hours: 1,
      minutes: 0,
      location: "",
      isRecurring: false,
      itsPomodoro: false,
      expiredPomodoro: false,
      groupList: [],
      author: user?.username || "",
      recurrencePattern: {
        frequency: undefined,
        endType: undefined,
        occurrences: 1,
        endDate: "",
      },
    },
  });

  function addToArray(newItem: PomodoroType) {
    setSession((prevArray) => {
      return [...prevArray, newItem];
    });
  }

  function createOptions() {
    const session = {
      hours: form.getValues("hours"),
      minutes: form.getValues("minutes"),
    };

    const totalTimeMs =
      session.hours * 60 * 60 * 1000 + session.minutes * 60 * 1000;

    if (totalTimeMs < 1000 * 60 * 30) {
      form.setError("root", {
        message: "Session must be of at least 30 minutes",
      });
      return;
    }
    if (totalTimeMs > 1000 * 60 * 60 * 24) {
      form.setError("root", {
        message: "Session can be a maximum of 24 hours",
      });
      return;
    }

    setSession([]);
    calculateOptions(totalTimeMs);
  }

  /**
   * Updates the sessions state
   * @param totalTime total session time in milliseconds
   * @param option number
   */
  function calculateOptions(totalTime: number) {
    const X = [];
    const Ratio = [];

    for (let x = 5 * 60 * 1000; x <= 15 * 60 * 1000; x = x + 5 * 60 * 1000) {
      for (let ratio = 7; ratio > 2; ratio = ratio - 0.5) {
        if (totalTime >= ratio * x + x) {
          X.push(x);
          Ratio.push(ratio);
        }
      }
    }

    createTimers(X, Ratio, totalTime);
  }

  /**
   * @param x base time in milliseconds, following the formula -> totalTime = ratio * cycles * x + cycles * x
   * @param ratio between study and pause time
   * @param totalTime in milliseconds
   * @returns a new timer based on study/pause ratio, base time and total session time
   */
  function createTimers(x: number[], ratio: number[], totalTime: number) {
    for (let index = 0; index < x.length; index++) {
      const relax: TimerType = {
        initialValue: x[index],
        value: x[index],
        started: false,
      };

      const study: TimerType = {
        initialValue: ratio[index] * x[index],
        value: ratio[index] * x[index],
        started: false,
      };

      const cycles = Math.floor(
        totalTime / (relax.initialValue + study.initialValue)
      );

      const newTimer: PomodoroType = {
        totalTime: (study.initialValue + relax.initialValue) * cycles,
        cycles,
        study,
        relax,
        isStudyCycle: true,
      };

      if (newTimer.totalTime / (60 * 60 * 1000) < 3) {
        if (
          totalTime % (study.initialValue + relax.initialValue) >= 0 &&
          totalTime % (study.initialValue + relax.initialValue) <=
            5 * 60 * 1000 &&
          newTimer.cycles < 11 &&
          Number.isInteger(study.initialValue / (60 * 1000))
        )
          addToArray(newTimer);
      } else {
        if (
          totalTime % (study.initialValue + relax.initialValue) >= 0 &&
          totalTime % (study.initialValue + relax.initialValue) <=
            25 * 60 * 1000 &&
          newTimer.cycles < 20 &&
          Number.isInteger(study.initialValue / (60 * 1000))
        )
          addToArray(newTimer);
      }
    }
  }

  function configurePomodoro(newTimer: PomodoroType | null) {
    setSelectedTimer(newTimer);

    form.setValue("expectedPomodoro.study", newTimer?.study.initialValue);
    form.setValue("expectedPomodoro.relax", newTimer?.relax.initialValue);
    form.setValue("expectedPomodoro.cycles", newTimer?.cycles);

    form.setValue("currPomodoro.study", newTimer?.study.initialValue);
    form.setValue("currPomodoro.relax", newTimer?.relax.initialValue);
    form.setValue("currPomodoro.cycles", newTimer?.cycles);
  }

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

    // check if it's pomodoro event
    if (event.itsPomodoro) {
      if (
        event.expectedPomodoro?.study &&
        event.expectedPomodoro.relax &&
        event.expectedPomodoro.cycles
      ) {
        // if the expected pomodoro has been created, update the currPomodoro field and duration
        event.currPomodoro = event.expectedPomodoro;
        event.hours = 0;
        event.minutes =
          ((event.expectedPomodoro.study + event.expectedPomodoro.relax) /
            60000) *
          event.expectedPomodoro.cycles;
      }
    }

    postEvent(event);

    setSelectedTimer(null);
    setSession([]);
    form.reset();
  }

  function loadFormFields(reader: FileReader) {
    const data = reader.result as string;
    const parsedData = ical.parseICS(data);

    Object.values(parsedData).forEach((component) => {
      if (component.type === "VEVENT") {  //eventi nei file iCalendar
        const startDate = component.start
          ? new Date(component.start)
          : new Date();
        const endDate = component.end
          ? new Date(component.end)
          : new Date(startDate.getTime() + 60 * 60 * 1000); // Default to 1 hour if end is not defined

        const hours =
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        const minutes =
          ((endDate.getTime() - startDate.getTime()) % (1000 * 60 * 60)) /
          (1000 * 60);

        let endT: "after" | "until" | undefined;
        let untilDate;

        let freq: "daily" | "weekly" | "monthly" | undefined;
        if (component.rrule?.options.freq === 1) {
          freq = "monthly";
        } else if (component.rrule?.options.freq === 2) {
          freq = "weekly";
        } else if (component.rrule?.options.freq === 3) {
          freq = "daily";
        } else {
          freq = undefined;
        }

        client_log(component);

        let occurrences: number | undefined;
        if (component.rrule && component.rrule.options.count) {
          endT = "after";
          occurrences = component.rrule.options.count;
        } else {
          endT = "until";
          occurrences = undefined;
        }
        if (component.rrule && component.rrule.options.until) {
          untilDate = new Date(component.rrule.options.until);
          if (isNaN(untilDate.getTime())) {
            untilDate = new Date();
          }
        } else {
          untilDate = new Date();
        }

        client_log(freq, occurrences, component.endDate);

        // Setting all form values manually, depends on event schema
        form.setValue("title", component.summary || "");
        form.setValue("date", startDate.toISOString().substring(0, 16));
        form.setValue("hours", hours);
        form.setValue("minutes", minutes);
        form.setValue("location", component.location || "");
        form.setValue("isRecurring", !!component.rrule);
        form.setValue("itsPomodoro", false);
        form.setValue("groupList", []);
        form.setValue("author", user?.username || "");
        form.setValue("recurrencePattern.frequency", freq);
        form.setValue("recurrencePattern.endType", endT);
        form.setValue("recurrencePattern.occurrences", occurrences);
        form.setValue(
          "recurrencePattern.endDate",
          untilDate.toISOString().substring(0, 16)
        );
        form.setValue("expectedPomodoro.study", 30);
        form.setValue("expectedPomodoro.relax", 5);
        form.setValue("expectedPomodoro.cycles", 5);
        form.setValue("currPomodoro.study", 30);
        form.setValue("currPomodoro.relax", 5);
        form.setValue("currPomodoro.cycles", 5);
      }
    });
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        loadFormFields(reader);
      } catch (error) {
        client_log("Error parsing ICS file:", error);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2 mt-2 w-full max-w-sm md:max-w-md"
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
              <FormLabel>Date</FormLabel>
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
              <FormLabel>It's Pomodoro</FormLabel>
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

        {/* Altri campi normali del form */}
        {/* Duration */}
        <div className="flex gap-5 items-center">
          <FormField
            control={form.control}
            name="hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hours</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.valueAsNumber); // vanilla react hook form is easier, but this will do
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minutes</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step={15}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.valueAsNumber); // vanilla react hook form is easier, but this will do
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {form.watch("itsPomodoro") && (
          <>
            {selectedTimer && (
              <Badge className="justify-center">
                Study {selectedTimer.study.initialValue / 60000}m + Relax{" "}
                {selectedTimer.relax.initialValue / 60000}
                {"m, "}
                {selectedTimer.cycles} cycles
              </Badge>
            )}

            <Button type="button" onClick={() => createOptions()}>
              Show Options
            </Button>

            <div className="grid grid-cols-3 gap-2">
              {session.map((timer, key) => (
                <Button
                  key={key}
                  type="button"
                  className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => configurePomodoro(timer)}
                >
                  {timer.study.initialValue / (1000 * 60)}/
                  {timer.relax.initialValue / (1000 * 60)} x {timer.cycles}
                </Button>
              ))}
            </div>
          </>
        )}

        {/* Location */}
        {!form.watch("itsPomodoro") && (
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
        )}

        {/* Recurring */}
        {!form.watch("itsPomodoro") && (
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
        )}

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

        <Button type="submit">
          {form.formState.isSubmitting ? <Loader /> : "Add Event"}
        </Button>
      </form>
    </Form>
  );
}
