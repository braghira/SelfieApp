import RelaxAnimation from "@/components/timer/RelaxAnimation";
import StudyAnimation from "@/components/timer/StudyAnimation";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/useTimer";
import { ChevronLast, Play, RotateCcwIcon, SkipForward } from "lucide-react";
import { useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PomodoroForm from "@/components/timer/PomodoroForm";

export default function Pomodoro() {
  const { timer, dispatch, InitialTimer, setInitialTimer } = useTimer();

  const remainder = useRef((timer.study.initialValue / 1000) % 5);
  const repetitions = useRef(
    (timer.study.initialValue / 1000 - remainder.current) / 10
  );
  const timeDiff = useRef(timer.study.value);

  function start() {
    dispatch({
      type: "START",
      payload: null,
    });
  }

  function reset() {
    dispatch({
      type: "SET",
      payload: InitialTimer,
    });
  }

  function restartStudy() {
    dispatch({
      type: "RESTART",
      payload: null,
    });

    remainder.current = (timer.study.initialValue / 1000) % 5;
    repetitions.current =
      (timer.study.initialValue / 1000 - remainder.current) / 10;
    timeDiff.current = timer.study.initialValue;

    const pulse1 = document.getElementById("pulse1");
    if (pulse1) {
      pulse1.style.animation = "none";
      pulse1.offsetHeight; // read-only property to trigger a reflow
      pulse1.style.animation = "";
      pulse1.style.animationIterationCount = `${repetitions.current}`;
      pulse1.style.animationPlayState = timer.study.started
        ? "running"
        : "paused";
    }

    const pulse2 = document.getElementById("pulse2");
    if (pulse2) {
      pulse2.style.animation = "none";
      pulse2.offsetHeight; // read-only property to trigger a reflow
      pulse2.style.animation = "";
      pulse2.style.animationIterationCount = `${repetitions.current}`;
      pulse2.style.animationPlayState = timer.study.started
        ? "running"
        : "paused";
    }

    const progressbar = document.getElementById("progbar");
    if (progressbar) {
      progressbar.style.animation = "none";
      progressbar.offsetHeight; // read-only property to trigger a reflow
      progressbar.style.animation = "";
      progressbar.style.animationDuration = `${timeDiff.current}ms`;
      progressbar.style.animationIterationCount = "1";
      progressbar.style.animationPlayState = timer.study.started
        ? "running"
        : "paused";
    }

    const orbit = document.getElementById("orbit");
    if (orbit) {
      orbit.style.animation = "none";
      orbit.offsetHeight; // read-only property to trigger a reflow
      orbit.style.animation = "";
      orbit.style.animationDuration = `${timeDiff.current}ms`;
      orbit.style.animationIterationCount = "1";
      orbit.style.animationPlayState = timer.study.started
        ? "running"
        : "paused";
    }
  }

  function restartRelax() {
    remainder.current = (timer.relax.initialValue / 1000) % 5;
    repetitions.current =
      (timer.relax.initialValue / 1000 - remainder.current) / 10;
    timeDiff.current = timer.relax.initialValue;

    const sunbar = document.getElementById("sunbar");
    if (sunbar) {
      sunbar.style.animation = "none";
      sunbar.offsetHeight; // read-only property to trigger a reflow
      sunbar.style.animation = "";
      sunbar.style.animationDuration = `${timeDiff.current}ms`;
      sunbar.style.animationIterationCount = "1";
      sunbar.style.animationPlayState = timer.relax.started
        ? "running"
        : "paused";
    }
  }

  return (
    <div className="view-container flex justify-center flex-col gap-5 md:flex-row sm:items-center mb-10">
      <div className="flex justify-start flex-col gap-5 max-w-[530px]">
        <h2>
          Welcome to the <span className="text-primary">Pomodoro</span> View!
        </h2>
        <p className="leading-8">
          Here you can set your pomodoro session in 2 ways:
          <ul className="list-disc">
            <li>
              <b>Timers</b>: Set the study and pause timer exactly how you want,
              including the number of study/pause cycles;
            </li>
            <li>
              <b>Session</b>: Insert a total session time and choose the option
              that best fits your needs.
            </li>
          </ul>
        </p>
      </div>

      <div className="flex-center flex-col gap-5 z-10">
        <h2>Cycles: {timer.cycles}</h2>

        {timer.isStudyCycle ? (
          <StudyAnimation
            timer={timer}
            dispatch={dispatch}
            remainder={remainder}
            repetitions={repetitions}
            timeDiff={timeDiff}
          />
        ) : (
          <RelaxAnimation
            timer={timer}
            dispatch={dispatch}
            remainder={remainder}
            repetitions={repetitions}
            timeDiff={timeDiff}
          />
        )}

        <div className="flex-center gap-5">
          <TooltipProvider>
            {(!timer.study.started || !timer.relax.started) &&
              timer.totalTime > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => {
                        start();
                      }}
                    >
                      <Play />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Start Timer</TooltipContent>
                </Tooltip>
              )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() =>
                    timer.totalTime == 0 ? reset() : restartStudy()
                  }
                >
                  <RotateCcwIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {timer.totalTime == 0 ? "Restart Session" : "Restart Cycle"}
              </TooltipContent>
            </Tooltip>

            {timer.totalTime > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      dispatch({
                        type: "SKIP",
                        payload: null,
                      });
                      restartRelax();
                    }}
                  >
                    <SkipForward />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Skip this timer</TooltipContent>
              </Tooltip>
            )}

            {/* Show only when we are not in the last cycle study timer */}
            {timer.cycles > 0 && (
              <Tooltip>
                <TooltipContent>Skip This Cycle</TooltipContent>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      dispatch({ type: "SKIPCYCLE", payload: null });
                    }}
                  >
                    <ChevronLast />
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </div>

      {!timer.study.started && (
        <PomodoroForm
          timer={timer}
          dispatch={dispatch}
          InitialTimer={InitialTimer}
          setInitialTimer={setInitialTimer}
        />
      )}
    </div>
  );
}
