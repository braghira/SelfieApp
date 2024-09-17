import React, { PropsWithChildren, createContext, useContext, useReducer, useEffect } from "react";

// Definisci i tipi di azione
type ActionType =
  | { type: 'SET_DATE'; payload: Date }
  | { type: 'TRAVEL_FORWARD'; payload: { days: number } }
  | { type: 'TRAVEL_BACKWARD'; payload: { days: number } }
  | { type: 'RESET_TO_REAL_TIME' }
  | { type: 'TICK' };  // Aggiungiamo l'azione per ogni tick dell'orologio

// Stato del Time Machine
type TimeStateType = {
  currentDate: Date;
  realDate: Date;
  offsetInMilliseconds: number;  // Offset rispetto al tempo reale
};

// Context
type TimeMachineContextType = {
  currentDate: Date;
  dispatch: React.Dispatch<ActionType>;
};

// Reducer
function timeMachineReducer(state: TimeStateType, action: ActionType): TimeStateType {
  switch (action.type) {
    case 'SET_DATE':
      return {
        ...state,
        offsetInMilliseconds: action.payload.getTime() - state.realDate.getTime(),
      };
    case 'TRAVEL_FORWARD':
      return {
        ...state,
        offsetInMilliseconds: state.offsetInMilliseconds + action.payload.days * 24 * 60 * 60 * 1000,
      };
    case 'TRAVEL_BACKWARD':
      return {
        ...state,
        offsetInMilliseconds: state.offsetInMilliseconds - action.payload.days * 24 * 60 * 60 * 1000,
      };
    case 'RESET_TO_REAL_TIME':
      return { ...state, offsetInMilliseconds: 0 };
    case 'TICK': {
      // Aggiorna la data corrente in base al tempo reale e l'offset
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
  dispatch: () => {},
};

// Crea il contesto
const TimeMachineContext = createContext<TimeMachineContextType>(defaultContextValue);

// Hook personalizzato per accedere al contesto
export function useTimeMachineContext() {
  const context = useContext(TimeMachineContext);

  if (!context) {
    throw new Error("useTimeMachineContext must be used within a TimeMachineProvider");
  }

  return context;
}

// Recupera l'offset dal localStorage
const loadOffsetFromStorage = (): number => {
  const storedOffset = localStorage.getItem('offsetInMilliseconds');
  return storedOffset ? parseInt(storedOffset, 10) : 0;
};

// Salva l'offset nel localStorage
const saveOffsetToStorage = (offset: number) => {
  localStorage.setItem('offsetInMilliseconds', offset.toString());
};

// Provider del contesto
export function TimeMachineProvider({ children }: PropsWithChildren) {
  // Inizializza lo stato con l'offset recuperato dal localStorage
  const initialState: TimeStateType = {
    currentDate: new Date(new Date().getTime() + loadOffsetFromStorage()),  // Imposta la data corrente con l'offset salvato
    realDate: new Date(),
    offsetInMilliseconds: loadOffsetFromStorage(),  // Carica l'offset salvato
  };

  const [state, dispatch] = useReducer(timeMachineReducer, initialState);

  // Effetto per aggiornare il tempo corrente basato sull'offset e il tempo reale
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'TICK' });  // Dispatch ad ogni tick (ogni secondo)
    }, 1000);

    return () => {
      clearInterval(interval);  // Pulizia al dismount del componente
    };
  }, [dispatch]);

  // Salva l'offset nel localStorage ogni volta che cambia
  useEffect(() => {
    saveOffsetToStorage(state.offsetInMilliseconds);
  }, [state.offsetInMilliseconds]);

  return (
    <TimeMachineContext.Provider value={{ currentDate: state.currentDate, dispatch }}>
      {children}
    </TimeMachineContext.Provider>
  );
}
