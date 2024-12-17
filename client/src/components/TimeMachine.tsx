import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useTimeMachineContext } from "@/context/TimeMachine";
import { format } from "date-fns";
import useEventsApi from "@/hooks/useEventsApi";
import useNotes from "@/hooks/useNote";
import useActivitiesApi from "@/hooks/useActivitiesApi";

const TimeMachinePopup = () => {
  const { currentDate, dispatch } = useTimeMachineContext();
  const { getEvents } = useEventsApi();
  const { fetchNotes } = useNotes();
  const { getActivities } = useActivitiesApi();
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [months, setMonths] = useState(0);
  const [years, setYears] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [shouldFetch, setShouldFetch] = useState(false);

  const validateInput = (value: number) => {
    return !isNaN(value) && value >= 0;
  };

  const handleTravelForward = () => {
    dispatch({
      type: "TRAVEL_FORWARD",
      payload: { days, hours, months, years, minutes },
    });
    setShouldFetch(true);
    resetInputs();
  };

  const handleTravelBackward = () => {
    dispatch({
      type: "TRAVEL_BACKWARD",
      payload: { days, hours, months, years, minutes },
    });
    setShouldFetch(true);
    resetInputs();
  };

  const handleReset = () => {
    dispatch({ type: "RESET_TO_REAL_TIME" });
    setShouldFetch(true);
    resetInputs();
  };

  const resetInputs = () => {
    setDays(0);
    setHours(0);
    setMonths(0);
    setYears(0);
    setMinutes(0);
  };

  useEffect(() => {
    if (shouldFetch) {
      getEvents();
      getActivities();
      fetchNotes();
      setShouldFetch(false);
    }
  }, [shouldFetch, getEvents, getActivities, fetchNotes]);

  return (
    <Dialog
      aria-labelledby="time-machine-dialog-title"
      aria-describedby="time-machine-dialog-description"
    >
      <DialogTrigger asChild>
        <Button
          className="bg-lime-600 text-white hover:bg-lime-700 flex items-center gap-2"
          aria-label="Open Time Machine"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 rotating-clock"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="hidden md:inline">Time Machine</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white dark:bg-black text-black dark:text-white p-4 rounded-xl border-lime-500 border-2 shadow-lg w-[95vw] max-w-[350px] sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            id="time-machine-dialog-title"
            className="text-lime-500 text-xl"
          >
            Time Machine
          </DialogTitle>
        </DialogHeader>

        <p id="time-machine-dialog-description" className="text-base mb-2">
          Current Date: {format(currentDate, "yyyy-MM-dd HH:mm:ss")}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
          <div>
            <Label htmlFor="years" className="text-xs text-lime-500">
              Years
            </Label>
            <Input
              id="years"
              type="text"
              value={years}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (validateInput(value)) {
                  setYears(value);
                }
              }}
              className="border-2 border-lime-500 rounded-lg p-1 text-black dark:text-white bg-white dark:bg-black text-sm h-9"
            />
          </div>
          <div>
            <Label htmlFor="months" className="text-xs text-lime-500">
              Months
            </Label>
            <Input
              id="months"
              type="text"
              value={months}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (validateInput(value)) {
                  setMonths(value);
                }
              }}
              className="border-2 border-lime-500 rounded-lg p-1 text-black dark:text-white bg-white dark:bg-black text-sm h-9"
            />
          </div>
          <div>
            <Label htmlFor="days" className="text-xs text-lime-500">
              Days
            </Label>
            <Input
              id="days"
              type="text"
              value={days}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (validateInput(value)) {
                  setDays(value);
                }
              }}
              className="border-2 border-lime-500 rounded-lg p-1 text-black dark:text-white bg-white dark:bg-black text-sm h-9"
            />
          </div>
          <div>
            <Label htmlFor="hours" className="text-xs text-lime-500">
              Hours
            </Label>
            <Input
              id="hours"
              type="text"
              value={hours}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (validateInput(value)) {
                  setHours(value);
                }
              }}
              className="border-2 border-lime-500 rounded-lg p-1 text-black dark:text-white bg-white dark:bg-black text-sm h-9"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="minutes" className="text-xs text-lime-500">
              Minutes
            </Label>
            <Input
              id="minutes"
              type="text"
              value={minutes}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (validateInput(value)) {
                  setMinutes(value);
                }
              }}
              className="border-2 border-lime-500 rounded-lg p-1 text-black dark:text-white bg-white dark:bg-black text-sm h-9"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-2 mt-2">
          <Button
            onClick={handleTravelBackward}
            className="bg-lime-600 text-black hover:bg-lime-700 text-sm py-2"
            aria-label="Travel Backward"
          >
            Travel Backward
          </Button>
          <Button
            onClick={handleTravelForward}
            className="bg-lime-600 text-black hover:bg-lime-700 text-sm py-2"
            aria-label="Travel Forward"
          >
            Travel Forward
          </Button>
        </div>

        <Button
          onClick={handleReset}
          className="mt-2 w-full bg-lime-600 text-black hover:bg-lime-700 text-sm py-2"
          aria-label="Reset to Real Time"
        >
          Reset to Real Time
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default TimeMachinePopup;
