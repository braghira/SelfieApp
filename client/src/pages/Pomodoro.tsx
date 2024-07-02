import { client_log } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export default function Pomodoro() {
  // stores the total time of the pomodoro session
  const [pomodoro, setPomodoro] = useState(1000 * 60);
  // stores the current study timer
  const [studyTimer, setStudyTimer] = useState(pomodoro);
  // stores current relax timer
  const [relaxTimer, setRelaxTimer] = useState();
  // stores the number of pomodoro sessions
  const resto = Math.floor((pomodoro / 1000) % 5);
  const repetitions = (pomodoro / 1000 - resto) / 10;

  useEffect(() => {
    const interval = setInterval(() => {
      if (studyTimer > 0) setStudyTimer((prevTimer) => prevTimer - 1000);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
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

  const format_timer = msToTime(studyTimer);

  return (
    <div className="container flex-center flex-col gap-3">
      <div className="relative w-[450px] h-[450px] overflow-hidden">
        {/* orbit animation based on timer */}
        <div
          className="rotating-container"
          style={{
            animationDuration: `${pomodoro}ms`,
            animationIterationCount: 1,
          }}
        >
          <div className="orbit"></div>
        </div>
        {/* pulse animation */}
        <div
          className="pomodoro"
          style={{
            animationDuration: `${pomodoro}ms`,
            animationIterationCount: 1,
          }}
        >
          <div className="pulse">
            <span style={{ animationIterationCount: repetitions }}></span>
            <span style={{ animationIterationCount: repetitions }}></span>
            <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] timer-medium text-red-50">
              {format_timer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
