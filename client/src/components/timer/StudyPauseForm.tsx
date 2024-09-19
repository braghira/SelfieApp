import { PomodoroAction, PomodoroType, TimerType } from "@/hooks/useTimer";
import { timeToMs } from "@/lib/utils";
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
import Loader from "../Loader";
import SharePomodoro from "./SharePomodoro";

interface StudyPauseFormProps {
  timer: PomodoroType;
  dispatch: React.Dispatch<PomodoroAction>;
  InitialTimer: PomodoroType;
  setInitialTimer: React.Dispatch<React.SetStateAction<PomodoroType>>;
}

const StudyRelaxSchema = z.object({
  studyTime: z.string().time({ precision: 0 }),
  relaxTime: z.string().time({ precision: 0 }),
  cycles: z.number().min(1, "Number of cycles must be at least 1"),
});

type StudyPauseType = z.infer<typeof StudyRelaxSchema>;

export default function StudyPauseForm({
  dispatch,
  setInitialTimer,
}: StudyPauseFormProps) {
  const form = useForm<StudyPauseType>({
    resolver: zodResolver(StudyRelaxSchema),
    defaultValues: {
      studyTime: "00:30:00",
      relaxTime: "00:05:00",
      cycles: 5,
    },
  });

  function onSubmit(session: StudyPauseType) {
    const studyTime = timeToMs(session.studyTime);
    const relaxTime = timeToMs(session.relaxTime);

    const study: TimerType = {
      initialValue: studyTime,
      value: studyTime,
      started: false,
    };

    const relax: TimerType = {
      initialValue: relaxTime,
      value: relaxTime,
      started: false,
    };

    const cycles = session.cycles;

    const newTimer: PomodoroType = {
      totalTime: (studyTime + relaxTime) * cycles,
      cycles,
      study,
      relax,
      isStudyCycle: true,
    };

    setInitialTimer(newTimer);

    dispatch({ type: "SET", payload: newTimer });
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 mt-4"
        >
          <FormField
            control={form.control}
            name="studyTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Study Timer</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="HH:MM:SS" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="relaxTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relax Timer</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="HH:MM:SS" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cycles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cycles</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="5"
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
          <Button type="submit">
            {form.formState.isSubmitting ? <Loader /> : "Set Pomodoro"}
          </Button>

          <SharePomodoro />
        </form>
      </Form>
    </>
  );
}
