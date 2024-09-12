import { PomodoroAction, PomodoroType, TimerType } from "@/hooks/useTimer";
import { msToTime } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface RelaxAnimationProps {
  timer: PomodoroType;
  dispatch: React.Dispatch<PomodoroAction>;
  remainder: React.MutableRefObject<number>;
  repetitions: React.MutableRefObject<number>;
  timeDiff: React.MutableRefObject<number>;
}

export default function RelaxAnimation({
  timer,
  dispatch,
  remainder,
  repetitions,
  timeDiff,
}: RelaxAnimationProps) {
  const timeouts = useRef<NodeJS.Timeout[]>([]);

  let i = 0;

  useEffect(() => {
    // in case of refresh or user changing views we store the current timer in the local storage
    const stored_timer = localStorage.getItem("pomodoro_timer");
    if (stored_timer) {
      const parsed_timer: PomodoroType = JSON.parse(stored_timer);
      remainder.current = (parsed_timer.relax.value / 1000) % 5;
      repetitions.current =
        (parsed_timer.relax.value / 1000 - remainder.current) / 10;
      timeDiff.current = parsed_timer.relax.value;

      dispatch({ payload: parsed_timer, type: "SET" });
    }
  }, [timer.relax.initialValue]);

  useEffect(() => {
    startPlucking(timer.relax.started);
  }, []);

  useEffect(() => {
    if (timer.relax.started) {
      if (timer.totalTime === 0) {
        timeDiff.current = 0;
        startPlucking(true);

        dispatch({
          type: "SET",
          payload: {
            study: timer.study,
            relax: { ...timer.relax, started: false },
            isStudyCycle: false,
            cycles: 0,
            totalTime: 0,
          },
        });
      }

      const interval = setInterval(() => {
        if (timer.relax.value > 0) {
          const newTimer: TimerType = {
            initialValue: timer.relax.initialValue,
            value: timer.relax.value - 1000,
            started: timer.relax.started,
          };
          dispatch({
            type: "SET",
            payload: {
              study: timer.study,
              relax: newTimer,
              cycles: timer.cycles,
              totalTime: timer.totalTime - 1000,
              isStudyCycle: false,
            },
          });
        } else {
          const restartTimer: TimerType = {
            initialValue: timer.relax.initialValue,
            value: timer.relax.initialValue,
            started: true,
          };
          dispatch({
            type: "SET",
            payload: {
              study: timer.study,
              relax: restartTimer,
              cycles: timer.cycles - 1,
              totalTime: timer.totalTime,
              isStudyCycle: true,
            },
          });
        }
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [dispatch, timer]);

  function startPlucking(started: boolean) {
    const petals = document.querySelectorAll(".petal");
    const delay = timeDiff.current / 16;

    // Clear any existing timeouts
    timeouts.current.forEach((timeout) => clearTimeout(timeout));
    timeouts.current = [];

    petals.forEach((petal, index) => {
      const element = petal as HTMLElement;

      if (!started) {
        element.style.transition = "none";
        element.style.opacity = "1";
        element.style.transform = `rotate(calc(22.5deg * ${index})) translate(0px, var(--petal-transform))`;
      } else {
        const timeoutId = setTimeout(() => {
          element.style.transition =
            "transform 2s ease-out, opacity 2s ease-out";
          element.style.transform = `rotate(calc(22.5deg * ${index})) translate(0px, calc(var(--petal-transform) + (var(--petal-transform) * 0.3))`;
          element.style.opacity = "0";
        }, index * delay); // Delay in milliseconds

        timeouts.current.push(timeoutId);
      }
    });
  }

  return (
    <div className="animation-container">
      <div
        className="relax-container"
        id="sunbar"
        style={{
          animationDuration: `${timeDiff.current}ms`,
          animationIterationCount: "1",
          animationPlayState: timer.relax.started ? "running" : "paused",
        }}
      >
        <div className="sunflower">
          <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] timer-medium text-yellow-50">
            {msToTime(timer.relax.value)}
          </div>
        </div>
        <div
          className="petal"
          style={{
            transform: `rotate(calc(22.5deg * ${i++})) translate(0px, var(--petal-transform))`,
          }}
        ></div>
        <div
          className="petal"
          style={{
            transform: `rotate(calc(22.5deg * ${i++})) translate(0px, var(--petal-transform))`,
          }}
        ></div>
        <div
          className="petal"
          style={{
            transform: `rotate(calc(22.5deg * ${i++})) translate(0px, var(--petal-transform))`,
          }}
        ></div>
        <div
          className="petal"
          style={{
            transform: `rotate(calc(22.5deg * ${i++})) translate(0px, var(--petal-transform))`,
          }}
        ></div>
        <div
          className="petal"
          style={{
            transform: `rotate(calc(22.5deg * ${i++})) translate(0px, var(--petal-transform))`,
          }}
        ></div>
        <div
          className="petal"
          style={{
            transform: `rotate(calc(22.5deg * ${i++})) translate(0px, var(--petal-transform))`,
          }}
        ></div>
        <div
          className="petal"
          style={{
            transform: `rotate(calc(22.5deg * ${i++})) translate(0px, var(--petal-transform))`,
          }}
        ></div>
        <div
          className="petal"
          style={{
            transform: `rotate(calc(22.5deg * ${i++})) translate(0px, var(--petal-transform))`,
          }}
        ></div>
        <div
          className="petal"
          style={{
            transform: `rotate(calc(22.5deg * ${i++})) translate(0px, var(--petal-transform))`,
          }}
        ></div>
        <div
          className="petal"
          style={{
            transform: `rotate(calc(22.5deg * ${i++})) translate(0px, var(--petal-transform))`,
          }}
        ></div>
        <div
          className="petal"
          style={{
            transform: `rotate(calc(22.5deg * ${i++})) translate(0px, var(--petal-transform))`,
          }}
        ></div>
        <div
          className="petal"
          style={{
            transform: `rotate(calc(22.5deg * ${i++})) translate(0px, var(--petal-transform))`,
          }}
        ></div>
        <div
          className="petal"
          style={{
            transform: `rotate(calc(22.5deg * ${i++})) translate(0px, var(--petal-transform))`,
          }}
        ></div>
        <div
          className="petal"
          style={{
            transform: `rotate(calc(22.5deg * ${i++})) translate(0px, var(--petal-transform))`,
          }}
        ></div>
        <div
          className="petal"
          style={{
            transform: `rotate(calc(22.5deg * ${i++})) translate(0px, var(--petal-transform))`,
          }}
        ></div>
        <div
          className="petal"
          style={{
            transform: `rotate(calc(22.5deg * ${i++})) translate(0px, var(--petal-transform))`,
          }}
        ></div>
      </div>
    </div>
  );
}
