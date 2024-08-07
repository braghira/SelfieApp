import { PomodoroAction, PomodoroType, TimerType } from "@/hooks/useTimer";
import { msToTime } from "@/lib/utils";
import { useEffect } from "react";

interface StudyAnimationProps {
  timer: PomodoroType;
  dispatch: React.Dispatch<PomodoroAction>;
  remainder: React.MutableRefObject<number>;
  repetitions: React.MutableRefObject<number>;
  timeDiff: React.MutableRefObject<number>;
}

export default function StudyAnimation({
  timer,
  dispatch,
  remainder,
  repetitions,
  timeDiff,
}: StudyAnimationProps) {
  useEffect(() => {
    // in case of refresh or user changing views we store the current timer in the local storage
    const stored_timer = localStorage.getItem("pomodoro_timer");
    if (stored_timer) {
      const parsed_timer: PomodoroType = JSON.parse(stored_timer);
      remainder.current = (parsed_timer.study.value / 1000) % 5;
      repetitions.current =
        (parsed_timer.study.value / 1000 - remainder.current) / 10;
      timeDiff.current = parsed_timer.study.value;
      dispatch({ payload: parsed_timer, type: "SET" });
    }
  }, [timer.study.initialValue]);

  useEffect(() => {
    if (timer.study.started) {
      const interval = setInterval(() => {
        if (timer.study.value > 0) {
          const newTimer: TimerType = {
            initialValue: timer.study.initialValue,
            value: timer.study.value - 1000,
            started: timer.study.started,
          };

          dispatch({
            type: "SET",
            payload: {
              study: newTimer,
              relax: timer.relax,
              cycles: timer.cycles,
              totalTime: timer.totalTime - 1000,
              isStudyCycle: true,
            },
          });
        } else {
          const restartTimer: TimerType = {
            initialValue: timer.study.initialValue,
            value: timer.study.initialValue,
            started: true,
          };
          dispatch({
            type: "SET",
            payload: {
              study: restartTimer,
              relax: timer.relax,
              cycles: timer.cycles,
              totalTime: timer.totalTime,
              isStudyCycle: false,
            },
          });
        }
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [dispatch, timer]);

  return (
    <div className="animation-container">
      {/* orbit animation based on timer */}
      <div
        className="rotating-container"
        id="orbit"
        style={{
          animationDuration: `${timeDiff.current}ms`,
          animationIterationCount: "1",
          animationPlayState: timer.study.started ? "running" : "paused",
        }}
      >
        <div className="orbit"></div>
      </div>
      {/* pulse animation with progress circle */}
      <div
        className="pomodoro"
        id="progbar"
        style={{
          animationDuration: `${timeDiff.current}ms`,
          animationIterationCount: "1",
          animationPlayState: timer.study.started ? "running" : "paused",
        }}
      >
        <div className="pulse">
          <span
            id="pulse1"
            style={{
              animationIterationCount: repetitions.current,
              animationPlayState: timer.study.started ? "running" : "paused",
            }}
          ></span>
          <span
            id="pulse2"
            style={{
              animationIterationCount: repetitions.current,
              animationPlayState: timer.study.started ? "running" : "paused",
            }}
          ></span>
          <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] timer-medium text-red-50">
            {msToTime(timer.study.value)}
          </div>
        </div>
      </div>
    </div>
  );
}
