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
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          className="bg-lime-600 text-white hover:bg-lime-700 flex items-center gap-2"
          aria-label="Open Time Machine dialog"
        >
          {/* Aggiunta dell'icona di orologio rotante con aria-label per accessibilità */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 rotating-clock"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true" // Nasconde l'icona dagli screen reader
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="hidden md:inline">Open Time Machine</span> {/* Nascondi su mobile */}
        </Button>
      </DialogTrigger>

      {/* Assicurati che il focus vada sul dialog quando è aperto */}
      <DialogContent 
        className="bg-black text-white p-6 rounded-xl border-lime-500 border-2 shadow-lg max-w-lg"
        aria-live="assertive" // Annuncia ai lettori di schermo che è attivo
        role="dialog"
        aria-modal="true"
      >
        <DialogHeader>
          <DialogTitle className="text-lime-500 text-2xl">Time Machine</DialogTitle>
        </DialogHeader>

        <p className="text-xl mb-4">
          Current Date: {format(currentDate, 'yyyy-MM-dd HH:mm:ss')}
        </p>

        <div className="mb-4 w-full">
          <Label htmlFor="days" className="text-sm text-lime-500">
            Enter Days
          </Label>
          <Input 
            id="days" // Aggiunta l'attributo id per collegare l'etichetta al campo di input
            type="number" 
            value={days} 
            onChange={(e) => setDays(Number(e.target.value))} 
            className="border-2 border-lime-500 rounded-lg p-2 w-full text-white bg-black" 
            min={1} 
            aria-label="Enter number of days for time travel" // Etichetta per screen reader
          />
        </div>

        <div className="flex justify-between gap-2 mt-4">
          <Button 
            onClick={handleTravelBackward} 
            className="bg-lime-600 text-black hover:bg-lime-700"
            aria-label={`Travel backward ${days} days`}
          >
            Travel Backward
          </Button>
          <Button 
            onClick={handleTravelForward} 
            className="bg-lime-600 text-black hover:bg-lime-700"
            aria-label={`Travel forward ${days} days`}
          >
            Travel Forward
          </Button>
        </div>

        <Button 
          onClick={handleReset} 
          className="mt-4 w-full bg-lime-600 text-black hover:bg-lime-700"
          aria-label="Reset to real time"
        >
          Reset to Real Time
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default TimeMachinePopup;
