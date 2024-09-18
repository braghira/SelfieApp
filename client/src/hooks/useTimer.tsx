import { useReducer, useState } from "react";
import moment from 'moment';
import { EventType } from "@/lib/utils";
import { useTimeMachineContext } from "@/context/TimeMachine";

export type TimerType = {
  initialValue: number;
  value: number;
  started: boolean;
};

export type PomodoroType = {
  study: TimerType;
  relax: TimerType;
  totalTime: number;
  cycles: number;
  isStudyCycle: boolean;
};

export type PomodoroAction = {
  type: "RESTART" | "START" | "SET" | "SKIP" | "SKIPCYCLE";
  payload: PomodoroType | null;
};

function timerReducer(
  prevState: PomodoroType,
  action: PomodoroAction
): PomodoroType {
  const study = { ...prevState.study };
  const relax = { ...prevState.relax };
  let cycles = prevState.cycles;
  let totalTime = prevState.totalTime;
  let isStudyCycle = prevState.isStudyCycle;

  switch (action.type) {
    case "START":
      study.started = true;
      relax.started = true;

      localStorage.setItem(
        "pomodoro_timer",
        JSON.stringify({
          study,
          relax,
          cycles,
          totalTime,
          isStudyCycle,
        })
      );

      localStorage.setItem(
        "lastestPomodoro",
        JSON.stringify({
          study,
          relax,
          cycles,
          totalTime,
          isStudyCycle,
        })
      );

      return {
        study: study,
        relax: relax,
        cycles,
        totalTime,
        isStudyCycle,
      };

    // should restart an entire cycle
    case "RESTART":
      if (isStudyCycle) {
        totalTime += study.initialValue - study.value;
      } else {
        totalTime += study.initialValue + (relax.initialValue - relax.value);
        isStudyCycle = true;
      }

      // restarting study timer
      study.value = study.initialValue;
      // restarting relax timer
      relax.value = relax.initialValue;

      localStorage.setItem(
        "pomodoro_timer",
        JSON.stringify({
          study,
          relax,
          cycles,
          totalTime,
          isStudyCycle,
        })
      );

      return {
        study,
        relax,
        cycles,
        totalTime,
        isStudyCycle,
      };

    case "SKIP":
      if (isStudyCycle) {
        totalTime -= study.value;

        // Resettare il valore del timer di studio
        study.value = study.initialValue;
        isStudyCycle = false;
      } else {
        totalTime -= relax.value;

        if (totalTime == 0) {
          relax.value = 0;
          relax.started = true;
          isStudyCycle = false;
          cycles = 0;
        } else {
          // Resettare il valore del timer di relax
          relax.value = relax.initialValue;
          cycles--;
          isStudyCycle = true;
        }
      }

      localStorage.setItem(
        "pomodoro_timer",
        JSON.stringify({
          study,
          relax,
          totalTime,
          cycles,
          isStudyCycle,
        })
      );

      return {
        study: study,
        relax: relax,
        totalTime,
        cycles,
        isStudyCycle,
      };

    case "SKIPCYCLE":
      if (isStudyCycle) {
        totalTime -= study.value + relax.initialValue;
        if (totalTime == 0) {
          relax.value = 0;
          relax.started = true;
          isStudyCycle = false;
        }
      } else {
        totalTime -= relax.value;
        if (totalTime == 0) {
          relax.value = 0;
          relax.started = true;
          isStudyCycle = false;
        } else {
          relax.value = relax.initialValue;
          isStudyCycle = true;
        }
      }

      study.value = study.initialValue;
      cycles--;

      localStorage.setItem(
        "pomodoro_timer",
        JSON.stringify({
          study,
          relax,
          cycles,
          totalTime,
          isStudyCycle,
        })
      );

      return {
        study: study,
        relax: relax,
        cycles,
        totalTime,
        isStudyCycle,
      };

    case "SET":
      if (action.payload) {
        localStorage.setItem("pomodoro_timer", JSON.stringify(action.payload));
        return action.payload;
      }
      return prevState;

    default:
      return prevState;
  }
}

export function useTimer(eventList: EventType[]) {
  const { currentDate } = useTimeMachineContext();
  let parsed_timer: PomodoroType | null = null;

  const storage = localStorage.getItem("pomodoro_timer");

  if (storage) {
    parsed_timer = JSON.parse(storage);
  }

  let todayEvent = null;
  if (eventList && eventList.length > 0) {
    const today = moment(currentDate);
    todayEvent = eventList.find(
      (event) => moment(event.date).isSame(today, 'day') && event.itsPomodoro
    );
  }


  let studyTimer;
  let relaxTimer;
  let cycles;
  if(todayEvent){
    studyTimer = {
      initialValue: todayEvent.pomodoro?.initStudy || 1000 * 60 * 30,
      value: todayEvent.pomodoro?.initStudy || 1000 * 60 * 30,
      started: false,
    };
    relaxTimer = {
      initialValue: todayEvent.pomodoro?.initRelax || 1000 * 60 * 5,
      value: todayEvent.pomodoro?.initRelax || 1000 * 60 * 5,
      started: false,
    };
    cycles = todayEvent.pomodoro?.cycles || 5;
  }
  else{
    // default is 30/5 with 5 cycles for a total of 175m
    studyTimer = {
      initialValue: 1000 * 60 * 30,
      value: 1000 * 60 * 30,
      started: false,
    };
    relaxTimer = {
      initialValue: 1000 * 60 * 5,
      value: 1000 * 60 * 5,
      started: false,
    };
    cycles = 5;
  }

    const totalTime =
      (studyTimer.initialValue + relaxTimer.initialValue) * cycles;
    const isStudyCycle = true;

    const [InitialTimer, setInitialTimer] = useState<PomodoroType>({
      cycles,
      isStudyCycle,
      relax: relaxTimer,
      study: studyTimer,
      totalTime,
    });


  // we check for the stored timer first, if it's not found then use the default timer
  let final_timer: PomodoroType;
  if (parsed_timer) final_timer = parsed_timer;
  else final_timer = InitialTimer;

  const [timer, dispatch] = useReducer(timerReducer, final_timer);

  return { timer, dispatch, InitialTimer, setInitialTimer };
}
