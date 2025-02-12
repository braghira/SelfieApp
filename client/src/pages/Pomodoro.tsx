import RelaxAnimation from "@/components/timer/RelaxAnimation";
import StudyAnimation from "@/components/timer/StudyAnimation";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/useTimer";
import { ChevronLast, Play, RotateCcwIcon, SkipForward } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PomodoroForm from "@/components/timer/PomodoroForm";
import usePushNotification, {
  NotificationPayload,
} from "@/hooks/usePushNotification";
import { useAuth } from "@/context/AuthContext";
import { BlockerFunction, useBlocker } from "react-router-dom";
import useEventsApi from "@/hooks/useEventsApi";
import { useEvents } from "@/context/EventContext";
import { useTimeMachineContext } from "@/context/TimeMachine";
import moment from "moment";
import { client_log, EventType } from "@/lib/utils";

export default function Pomodoro() {
  const { RequestPushSub, sendNotification } = usePushNotification();
  const { user } = useAuth();
  const { events } = useEvents();
  const { postEvent, updateEvent } = useEventsApi();
  const { timer, dispatch, InitialTimer, setInitialTimer } = useTimer();
  const { currentDate } = useTimeMachineContext();
  const [open, setOpen] = useState(false);
  const [session, setPomodoroSession] = useState<EventType | undefined>(
    undefined
  );

  // Block navigating elsewhere when data has been entered into the input
  const shouldBlock = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) =>
      timer.study.started &&
      timer.relax.started &&
      currentLocation.pathname !== nextLocation.pathname,
    [timer.relax.started, timer.study.started]
  );
  const blocker = useBlocker(shouldBlock);

  const remainder = useRef((timer.study.initialValue / 1000) % 5);
  const repetitions = useRef(
    (timer.study.initialValue / 1000 - remainder.current) / 10
  );
  const timeDiff = useRef(timer.study.value);

  async function start() {
    // Set the initial timer correctly in case we didn't set the pomodoro session with the forms
    setInitialTimer(timer);

    dispatch({
      type: "START",
      payload: null,
    });

    // Find pomodoro of the day with same session
    let todaysPomodoro = events.find(
      (e) =>
        moment(e.date).isSame(currentDate, "day") &&
        e.currPomodoro?.study === timer.study.initialValue &&
        e.currPomodoro?.relax === timer.relax.initialValue &&
        !e.expiredPomodoro
    );

    const pomodoro = {
      study: timer.study.initialValue,
      relax: timer.relax.initialValue,
      cycles: timer.cycles,
    };
    // Minutes for pomodoro event
    const mins = Math.floor(timer.totalTime / 60000);

    if (!todaysPomodoro) {
      const newPomodoroEvent: EventType = {
        itsPomodoro: true,
        date: currentDate.toISOString(),
        hours: 0,
        minutes: mins,
        isRecurring: false,
        title: "Pomodoro",
        currPomodoro: pomodoro,
        expectedPomodoro: pomodoro,
        groupList: [],
        expiredPomodoro: false,
      };
      // crea il nuovo evento pomodoro di oggi
      todaysPomodoro = await postEvent(newPomodoroEvent);
    }

    // Todays Pomodoro exists but number of cycles of selected session is greater
    if (
      todaysPomodoro?.expectedPomodoro?.cycles &&
      todaysPomodoro?.currPomodoro?.cycles &&
      timer.cycles > todaysPomodoro.expectedPomodoro?.cycles
    ) {
      // Add leftover cycles to todays pomodoro
      todaysPomodoro.currPomodoro.cycles +=
        timer.cycles - todaysPomodoro.expectedPomodoro.cycles;
      todaysPomodoro.expectedPomodoro.cycles = timer.cycles;

      await updateEvent(todaysPomodoro);
    }

    setPomodoroSession(todaysPomodoro);

    client_log("Pomodoro: ", todaysPomodoro);
  }

  function reset() {
    dispatch({
      type: "SET",
      payload: InitialTimer,
    });
    setPomodoroSession(undefined);
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

  useEffect(() => {
    if (blocker.state === "blocked") {
      setOpen(true);
    }
  }, [blocker.state]);

  // send a notification every time we start next phase
  useEffect(() => {
    const payload: NotificationPayload = {
      title: "Pomodoro Timer",
      body: timer.isStudyCycle ? "Study timer started" : "Relax timer started",
      url: `${window.origin}/pomodoro`,
    };

    const userID = user?._id;

    if (
      userID &&
      timer.study.started &&
      timer.relax.started &&
      timer.cycles > 0
    )
      RequestPushSub(() => sendNotification(userID, payload));
  }, [timer.isStudyCycle]);

  // Session FINISHED
  useEffect(() => {
    // UPDATE todays pomodoro cycles
    if (session?._id && session?.currPomodoro?.cycles) {
      session.currPomodoro.cycles = timer.cycles;
      updateEvent(session);

      console.log("cycles: ", timer.cycles);
    }

    const payload: NotificationPayload = {
      title: "Pomodoro Timer",
      body: "Pomodoro session finished! Wheew",
      url: `${window.origin}/pomodoro`,
    };

    const userID = user?._id;

    if (userID && timer.cycles === 0 && timer.relax.started) {
      RequestPushSub(() => sendNotification(userID, payload));
    }
  }, [timer.cycles]);

  return (
    <div className="view-container flex justify-center flex-col gap-5 md:flex-row sm:items-center mb-10">
      <div className="flex justify-start flex-col gap-5 max-w-[530px]">
        <h2>
          Welcome to the <span className="text-primary">Pomodoro</span> View!
        </h2>
        <p className="leading-6">
          Here you can set your pomodoro session in 2 ways:
        </p>
        <ul className="list-disc small-regular sm:base-regular">
          <li className="leading-6">
            <b>Timers</b>: Set the study and pause timer exactly how you want,
            including the number of study/pause cycles;
          </li>
          <li className="leading-6">
            <b>Session</b>: Insert a total session time and choose the option
            that best fits your needs.
          </li>
        </ul>
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

        {/* Buttons */}
        <div className="flex-center gap-5">
          <TooltipProvider>
            {(!timer.study.started || !timer.relax.started) &&
              timer.totalTime > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => {
                        start();

                        const payload: NotificationPayload = {
                          title: "Pomodoro Timer",
                          body: "Pomodoro session started",
                          url: `${window.origin}/pomodoro`,
                        };

                        const userID = user?._id;

                        if (
                          userID &&
                          timer.totalTime === InitialTimer.totalTime &&
                          !timer.study.started
                        )
                          RequestPushSub(() =>
                            sendNotification(userID, payload)
                          );
                      }}
                    >
                      <Play />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Start Timer</TooltipContent>
                </Tooltip>
              )}

            {timer.study.started && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() =>
                      timer.totalTime === 0 ? reset() : restartStudy()
                    }
                  >
                    <RotateCcwIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {timer.totalTime === 0 ? "Restart Session" : "Restart Cycle"}
                </TooltipContent>
              </Tooltip>
            )}

            {timer.study.started && timer.totalTime > 0 && (
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
            {timer.cycles > 0 && timer.study.started && (
              <Tooltip>
                <TooltipContent>Skip This Cycle</TooltipContent>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      dispatch({ type: "SKIPCYCLE", payload: null });
                      remainder.current = (timer.study.initialValue / 1000) % 5;
                      repetitions.current =
                        (timer.study.initialValue / 1000 - remainder.current) /
                        10;
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
                        progressbar.style.animationPlayState = timer.study
                          .started
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

      {/* Forms */}
      {!timer.study.started && (
        <PomodoroForm
          timer={timer}
          dispatch={dispatch}
          InitialTimer={InitialTimer}
          setInitialTimer={setInitialTimer}
        />
      )}

      {/* Dialog Window */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              All non-completed cycles will be automatically added to your next
              pomodoro session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                if (blocker.state === "blocked") blocker.reset();
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (blocker.state === "blocked") {
                  localStorage.removeItem("pomodoro_timer");
                  blocker.proceed();
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
