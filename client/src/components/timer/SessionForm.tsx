import { PomodoroAction, PomodoroType, TimerType } from "@/hooks/useTimer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import SharePomodoro from "./SharePomodoro";

interface SessionProps {
  timer: PomodoroType;
  dispatch: React.Dispatch<PomodoroAction>;
  InitialTimer: PomodoroType;
  setInitialTimer: React.Dispatch<React.SetStateAction<PomodoroType>>;
}

const SessionSchema = z.object({
  hours: z.number({ message: "Input a number" }).nonnegative(),
  minutes: z.number({ message: "Input a number" }).nonnegative().multipleOf(5),
});

type SessionType = z.infer<typeof SessionSchema>;

export default function SessionForm({
  dispatch,
  setInitialTimer,
}: SessionProps) {
  const form = useForm<SessionType>({
    resolver: zodResolver(SessionSchema),
    defaultValues: {
      hours: 3,
      minutes: 0,
    },
  });

  const [session, setSession] = useState<PomodoroType[]>([]);

  function addToArray(newItem: PomodoroType) {
    setSession((prevArray) => {
      return [...prevArray, newItem];
    });
  }

  function onSubmit(session: SessionType) {
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

  function setPomodoro(newTimer: PomodoroType | null) {
    if (newTimer) {
      setInitialTimer(newTimer);

      dispatch({ type: "SET", payload: newTimer });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5 mt-4"
      >
        <div className="flex gap-5">
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

        {form.formState.errors.root && (
          <FormMessage>{form.formState.errors.root.message}</FormMessage>
        )}

        <Button type="submit">Show Options</Button>

        {form.formState.isSubmitSuccessful && (
          <div className="grid grid-cols-3 gap-2">
            {session.map((timer, key) => (
              <Button
                key={key}
                type="button"
                onClick={() => setPomodoro(timer)}
              >
                {timer.study.initialValue / (1000 * 60)}/
                {timer.relax.initialValue / (1000 * 60)} x {timer.cycles}
              </Button>
            ))}
          </div>
        )}

        <SharePomodoro />
      </form>
    </Form>
  );
}
