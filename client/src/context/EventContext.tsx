import { ReactElement, createContext, useContext, useReducer } from "react";
import { EventType } from "@/lib/utils";

// types for the reducer
type ActionType =
  | { type: "SET_EVENTS"; payload: EventType[] }
  | { type: "CREATE_EVENT"; payload: EventType[] }
  | { type: "DELETE_EVENT"; payload: EventType[] }
  | { type: "UPDATE_EVENT"; payload: EventType };

export type EventContextType =
  | {
      events: EventType[];
      dispatch: React.Dispatch<ActionType>;
    }
  | undefined;

// definiamo qui le azioni possibili sul contesto
function eventsReducer(state: EventType[], action: ActionType): EventType[] {
  switch (action.type) {
    case "SET_EVENTS":
      // potrebbero non esserci documenti nel database, in quel caso il backend restituisce un array vuoto
      return action.payload;
    case "CREATE_EVENT":
      if (Array.isArray(state)) return [...action.payload, ...state];
      else return action.payload;
    case "DELETE_EVENT":
      return state.filter((event) => event._id !== action.payload[0]._id);
    case "UPDATE_EVENT":
      return state.map((event) =>
        event._id === action.payload._id ? action.payload : event
      );
    default:
      throw Error("action selected is not defined");
  }
}

const EventContext = createContext<EventContextType>(undefined);

export function useEvents() {
  const context = useContext(EventContext);

  if (!context) {
    throw Error("useEventContext must be used inside an EventContextProvider");
  }

  return context; // posso usare eventi e dispatch
}

interface EventContextProps {
  children: ReactElement | ReactElement[] | undefined;  //posso avere altri componenti come figli
}

export function EventContextProvider({ children }: EventContextProps) {
  const [state, dispatch] = useReducer(eventsReducer, []);

  return (  
    <EventContext.Provider value={{ events: state, dispatch }}> 
      {children}
    </EventContext.Provider>
  );
}
