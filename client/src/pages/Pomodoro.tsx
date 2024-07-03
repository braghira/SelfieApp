import { Button } from "@/components/ui/button";
import { client_log } from "@/lib/utils";
import { Play, RotateCcwIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type TimerType = {
  initialValue: number;
  value: number;
  started: boolean;
};

export default function Pomodoro() {
  // stores the current study timer
  const [studyTimer, setStudyTimer] = useState<TimerType>({
    initialValue: 1000 * 17,
    value: 1000 * 17,
    started: false,
  });
  // stores current relax timer
  const [relaxTimer, setRelaxTimer] = useState<TimerType>();
  // stores the number of pomodoro sessions
  const resto = useRef((studyTimer.initialValue / 1000) % 5);
  const repetitions = useRef(
    (studyTimer.initialValue / 1000 - resto.current) / 10
  );
  const time_diff = useRef(studyTimer.value);

  useEffect(() => {
    client_log("repetitions: ", repetitions.current);
    // in case of refresh or user changing views we store the current timer in the local storage
    const stored_timer = localStorage.getItem("pomodoro_timer");
    if (stored_timer) {
      const parsed_timer: TimerType = JSON.parse(stored_timer);
      resto.current = (parsed_timer.value / 1000) % 5;
      repetitions.current = (parsed_timer.value / 1000 - resto.current) / 10;
      time_diff.current = parsed_timer.value;
      setStudyTimer(parsed_timer);
    }
  }, []);

  useEffect(() => {
    if (studyTimer.started) {
      const interval = setInterval(() => {
        if (studyTimer.value > 0)
          setStudyTimer((prevTimer) => {
            const newTimer = {
              initialValue: prevTimer.initialValue,
              value: prevTimer.value - 1000,
              started: prevTimer.started,
            };
            localStorage.setItem("pomodoro_timer", JSON.stringify(newTimer));
            return newTimer;
          });
        else {
          localStorage.removeItem("pomodoro_timer");
        }
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [studyTimer]);

  function msToTime(s: number) {
    // Pad to 2 or 3 digits, default is 2
    function pad(n: number, z: number = 2) {
      return ("00" + n).slice(-z);
    }

    const ms = s % 1000;
    s = (s - ms) / 1000;
    const secs = s % 60;
    s = (s - secs) / 60;
    const mins = s % 60;
    const hrs = (s - mins) / 60;

    return pad(hrs) + ":" + pad(mins) + ":" + pad(secs);
  }

  const format_timer = msToTime(studyTimer.value);

  function handleRestart() {
    setStudyTimer({
      initialValue: studyTimer.initialValue,
      value: studyTimer.initialValue,
      started: false,
    });
    localStorage.setItem("pomodoro_timer", JSON.stringify(studyTimer));
    resto.current = (studyTimer.initialValue / 1000) % 5;
    repetitions.current = (studyTimer.initialValue / 1000 - resto.current) / 10;
    time_diff.current = studyTimer.initialValue;

    const pulse1 = document.getElementById("pulse1");
    if (pulse1) {
      pulse1.style.animation = "none";
      pulse1.offsetHeight; // read-only property to trigger a reflow
      pulse1.style.animation = "";
      pulse1.style.animationIterationCount = `${repetitions.current}`;
      pulse1.style.animationPlayState = studyTimer.started
        ? "running"
        : "paused";
    }

    const pulse2 = document.getElementById("pulse2");
    if (pulse2) {
      pulse2.style.animation = "none";
      pulse2.offsetHeight; // read-only property to trigger a reflow
      pulse2.style.animation = "";
      pulse2.style.animationIterationCount = `${repetitions.current}`;
      pulse2.style.animationPlayState = studyTimer.started
        ? "running"
        : "paused";
    }

    const progressbar = document.getElementById("progbar");
    if (progressbar) {
      progressbar.style.animation = "none";
      progressbar.offsetHeight; // read-only property to trigger a reflow
      progressbar.style.animation = "";
      progressbar.style.animationDuration = `${time_diff.current}ms`;
      progressbar.style.animationIterationCount = "1";
      progressbar.style.animationPlayState = studyTimer.started
        ? "running"
        : "paused";
    }

    const orbit = document.getElementById("orbit");
    if (orbit) {
      orbit.style.animation = "none";
      orbit.offsetHeight; // read-only property to trigger a reflow
      orbit.style.animation = "";
      orbit.style.animationDuration = `${time_diff.current}ms`;
      orbit.style.animationIterationCount = "1";
      orbit.style.animationPlayState = studyTimer.started
        ? "running"
        : "paused";
    }
  }

  return (
    <div className="container flex-center gap-3">
      {/* Study Animation */}
      <div className="study">
        {/* orbit animation based on timer */}
        <div
          className="rotating-container"
          id="orbit"
          style={{
            animationDuration: `${time_diff.current}ms`,
            animationIterationCount: "1",
            animationPlayState: studyTimer.started ? "running" : "paused",
          }}
        >
          <div className="orbit"></div>
        </div>
        {/* pulse animation with progress circle */}
        <div
          className="pomodoro"
          id="progbar"
          style={{
            animationDuration: `${time_diff.current}ms`,
            animationIterationCount: "1",
            animationPlayState: studyTimer.started ? "running" : "paused",
          }}
        >
          <div className="pulse">
            <span
              id="pulse1"
              style={{
                animationIterationCount: repetitions.current,
                animationPlayState: studyTimer.started ? "running" : "paused",
              }}
            ></span>
            <span
              id="pulse2"
              style={{
                animationIterationCount: repetitions.current,
                animationPlayState: studyTimer.started ? "running" : "paused",
              }}
            ></span>
            <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] timer-medium text-red-50">
              {format_timer}
            </div>
          </div>
        </div>
      </div>

      <Button onClick={() => handleRestart()}>
        <RotateCcwIcon />
      </Button>

      {!studyTimer.started && (
        <Button
          onClick={() =>
            setStudyTimer({
              initialValue: studyTimer.initialValue,
              value: studyTimer.value,
              started: true,
            })
          }
        >
          <Play />
        </Button>
      )}
    </div>
  );
}
