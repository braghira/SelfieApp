import { PomodoroAction, PomodoroType } from "@/hooks/useTimer";
import StudyPauseForm from "./StudyPauseForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SessionForm from "./SessionForm";

interface PomodoroFormProps {
  timer: PomodoroType;
  dispatch: React.Dispatch<PomodoroAction>;
  InitialTimer: PomodoroType;
  setInitialTimer: React.Dispatch<React.SetStateAction<PomodoroType>>;
}

export default function PomodoroForm({
  timer,
  dispatch,
  InitialTimer,
  setInitialTimer,
}: PomodoroFormProps) {
  return (
    <div className="flex-center sm:flex-col gap-5" id="pomodoro-form">
      <Tabs defaultValue="single timers">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="single timers">Timers</TabsTrigger>
          <TabsTrigger value="session time">Session</TabsTrigger>
        </TabsList>
        <TabsContent value="single timers">
          <StudyPauseForm
            InitialTimer={InitialTimer}
            setInitialTimer={setInitialTimer}
            timer={timer}
            dispatch={dispatch}
          />
        </TabsContent>
        <TabsContent value="session time">
          <SessionForm
            InitialTimer={InitialTimer}
            setInitialTimer={setInitialTimer}
            timer={timer}
            dispatch={dispatch}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
