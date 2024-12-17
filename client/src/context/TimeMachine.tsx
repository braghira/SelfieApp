import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useReducer,
  useEffect,
} from "react";

// Definisci i tipi di azione
type ActionType =
  | { type: "SET_DATE"; payload: Date }
  | {
      type: "TRAVEL_FORWARD";
      payload: {
        days: number;
        hours?: number;
        months?: number;
        years?: number;
        minutes?: number;
      };
    }
  | {
      type: "TRAVEL_BACKWARD";
      payload: {
        days: number;
        hours?: number;
        months?: number;
        years?: number;
        minutes?: number;
      };
    }
  | { type: "RESET_TO_REAL_TIME" }
  | { type: "TICK" }; // simulazione del tick dell'orologio

// Stato del Time Machine
type TimeStateType = {
  currentDate: Date; // Data e ora correnti combinati
  realDate: Date; // Data e ora reali
  offsetInMilliseconds: number; // Offset rispetto al tempo reale
};

// Context
type TimeMachineContextType = {
  currentDate: Date;
  currentTime: Date; 
  dispatch: React.Dispatch<ActionType>;
};

// Reducer
function timeMachineReducer(
  state: TimeStateType,
  action: ActionType
): TimeStateType {
  switch (action.type) {
    case "SET_DATE":
      return {
        ...state,
        offsetInMilliseconds:
          action.payload.getTime() - state.realDate.getTime(),
      };
      case "TRAVEL_FORWARD": {
        const { days, hours = 0, months = 0, years = 0, minutes = 0 } = action.payload;
      
        // Normalizza la data eliminando secondi e millisecondi
        const normalizedDate = new Date(state.currentDate);
        normalizedDate.setSeconds(0, 0);
      
        // Applica le modifiche alla data
        normalizedDate.setDate(normalizedDate.getDate() + days);
        normalizedDate.setHours(normalizedDate.getHours() + hours);
        normalizedDate.setMinutes(normalizedDate.getMinutes() + minutes);
        normalizedDate.setMonth(normalizedDate.getMonth() + months);
        normalizedDate.setFullYear(normalizedDate.getFullYear() + years);
      
        const totalOffset = normalizedDate.getTime() - state.realDate.getTime();
      
        return {
          ...state,
          offsetInMilliseconds: totalOffset,
          currentDate: normalizedDate,
        };
      }
      case "TRAVEL_BACKWARD": {
        const { days, hours = 0, months = 0, years = 0, minutes = 0 } = action.payload;
      
        // Normalizza la data eliminando secondi e millisecondi
        const normalizedDate = new Date(state.currentDate);
        normalizedDate.setSeconds(0, 0);
      
        // Applica le modifiche alla data
        normalizedDate.setDate(normalizedDate.getDate() - days);
        normalizedDate.setHours(normalizedDate.getHours() - hours);
        normalizedDate.setMinutes(normalizedDate.getMinutes() - minutes);
        normalizedDate.setMonth(normalizedDate.getMonth() - months);
        normalizedDate.setFullYear(normalizedDate.getFullYear() - years);
      
        const totalOffset = normalizedDate.getTime() - state.realDate.getTime();
      
        return {
          ...state,
          offsetInMilliseconds: totalOffset,
          currentDate: normalizedDate,
        };
      }      
    case "RESET_TO_REAL_TIME":
      return { ...state, offsetInMilliseconds: 0 };
    case "TICK": {
      const realTime = new Date().getTime();
      return {
        ...state,
        currentDate: new Date(realTime + state.offsetInMilliseconds),
      };
    }
    default:
      return state;
  }
}

// Valore di default per il contesto
const defaultContextValue: TimeMachineContextType = {
  currentDate: new Date(),
  currentTime: new Date(),
  dispatch: () => {},
};

// Crea il contesto
const TimeMachineContext =
  createContext<TimeMachineContextType>(defaultContextValue);

// Hook personalizzato per accedere al contesto
export function useTimeMachineContext() {
  const context = useContext(TimeMachineContext);

  if (!context) {
    throw new Error(
      "useTimeMachineContext must be used within a TimeMachineProvider"
    );
  }

  return context;
}

// Recupera l'offset dal localStorage
const loadOffsetFromStorage = (): number => {
  const storedOffset = localStorage.getItem("offsetInMilliseconds");
  return storedOffset ? parseInt(storedOffset, 10) : 0;
};

// Salva l'offset nel localStorage
const saveOffsetToStorage = (offset: number) => {
  localStorage.setItem("offsetInMilliseconds", offset.toString());
};

// Provider del contesto
export function TimeMachineProvider({ children }: PropsWithChildren) {
  // Inizializza lo stato con l'offset recuperato dal localStorage
  const initialState: TimeStateType = {
    currentDate: new Date(new Date().getTime() + loadOffsetFromStorage()), // Imposta la data corrente con l'offset salvato
    realDate: new Date(),
    offsetInMilliseconds: loadOffsetFromStorage(), // Carica l'offset salvato
  };

  const [state, dispatch] = useReducer(timeMachineReducer, initialState);

  // Effetto per aggiornare il tempo corrente basato sull'offset e il tempo reale
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "TICK" }); // Dispatch ad ogni tick (ogni secondo)
    }, 1000);

    return () => {
      clearInterval(interval); // Pulizia al dismount del componente
    };
  }, [dispatch]);

  // Salva l'offset nel localStorage ogni volta che cambia
  useEffect(() => {
    saveOffsetToStorage(state.offsetInMilliseconds);
  }, [state.offsetInMilliseconds]);

  // Calcola l'orario corrente separatamente dalla data
  const currentTime = new Date(state.currentDate);
  currentTime.setSeconds(0);
  currentTime.setMilliseconds(0);

  return (
    <TimeMachineContext.Provider
      value={{ currentDate: state.currentDate, currentTime, dispatch }}
    >
      {children}
    </TimeMachineContext.Provider>
  );
}
