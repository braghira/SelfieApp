import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useTimeMachineContext } from '@/context/TimeMachine'; 
import { format } from 'date-fns';

const TimeMachinePopup = () => {
  const { currentDate, dispatch } = useTimeMachineContext();
  const [days, setDays] = useState(1);

  const handleTravelForward = () => {
    console.log("Travel Forward Clicked - Dispatching action");
    dispatch({ type: 'TRAVEL_FORWARD', payload: { days } });
  };

  const handleTravelBackward = () => {
    dispatch({ type: 'TRAVEL_BACKWARD', payload: { days } });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_TO_REAL_TIME' });
  };

  return (
    <Dialog aria-labelledby="time-machine-dialog-title" aria-describedby="time-machine-dialog-description">
      <DialogTrigger asChild>
        <Button className="bg-lime-600 text-white hover:bg-lime-700 flex items-center gap-2" aria-label="Open Time Machine">
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

      <DialogContent 
        className="bg-white dark:bg-black text-black dark:text-white p-6 rounded-xl border-lime-500 border-2 shadow-lg max-w-lg"
        aria-labelledby="time-machine-dialog-title"
        aria-describedby="time-machine-dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="time-machine-dialog-title" className="text-lime-500 text-2xl">Time Machine</DialogTitle>
        </DialogHeader>

        <p id="time-machine-dialog-description" className="text-xl mb-4">
          Current Date: {format(currentDate, 'yyyy-MM-dd HH:mm:ss')}
        </p>

        <div className="mb-4 w-full">
          <Label htmlFor="days" className="text-sm text-lime-500">Enter Days</Label>
          <Input 
            id="days"
            type="number" 
            value={days} 
            onChange={(e) => setDays(Number(e.target.value))} 
            className="border-2 border-lime-500 rounded-lg p-2 w-full text-black dark:text-white bg-white dark:bg-black" 
            min={1} 
            aria-describedby="days-description"
          />
        </div>

        <div className="flex justify-between gap-2 mt-4">
          <Button onClick={handleTravelBackward} className="bg-lime-600 text-black hover:bg-lime-700" aria-label="Travel Backward">
            Travel Backward
          </Button>
          <Button onClick={handleTravelForward} className="bg-lime-600 text-black hover:bg-lime-700" aria-label="Travel Forward">
            Travel Forward
          </Button>
        </div>

        <Button onClick={handleReset} className="mt-4 w-full bg-lime-600 text-black hover:bg-lime-700" aria-label="Reset to Real Time">
          Reset to Real Time
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default TimeMachinePopup;
