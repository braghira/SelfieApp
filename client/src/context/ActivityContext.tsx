import { ReactElement, createContext, useContext, useReducer } from "react";
import { ActivityType, client_log } from "@/lib/utils";

// types for the reducer
type ActionType =
  | { type: "SET_ACTIVITIES"; payload: ActivityType[] }
  | { type: "CREATE_ACTIVITY"; payload: ActivityType[] }
  | { type: "DELETE_ACTIVITY"; payload: ActivityType[] }
  | { type: "UPDATE_ACTIVITY"; payload: ActivityType };


export type ActivityContextType =
  | {
      activities: ActivityType[];
      dispatch: React.Dispatch<ActionType>;
    }
  | undefined;

// definiamo qui le azioni possibili sul contesto
function activitiesReducer(
  state: ActivityType[],
  action: ActionType
): ActivityType[] {
  client_log("state: ", state);
  client_log("payload: ", action.payload);
  switch (action.type) {
    case "SET_ACTIVITIES":
      // potrebbero non esserci documenti nel database, in quel caso il backend restituisce un array vuoto
      return action.payload;
    case "CREATE_ACTIVITY":
      if (Array.isArray(state)) return [...action.payload, ...state];
      else return action.payload;
    case "DELETE_ACTIVITY":
      return state.filter((activity) => activity._id !== action.payload[0]._id);
    case "UPDATE_ACTIVITY":
      return state.map((activity) =>
        activity._id === action.payload._id ? action.payload : activity);
    default:
      throw Error("action selected is not defined");
  }
}

const ActivityContext = createContext<ActivityContextType>(undefined);

export function useActivities() {
  const context = useContext(ActivityContext);

  if (!context) {
    throw Error(
      "useActivityContext must be used inside a ActivityContextProvider"
    );
  }

  return context;
}

interface ActivityContextProps {
  children: ReactElement | ReactElement[] | undefined;
}

export function ActivityContextProvider({ children }: ActivityContextProps) {
  const [state, dispatch] = useReducer(activitiesReducer, []);

  return (
    <ActivityContext.Provider value={{ activities: state, dispatch }}>
      {children}
    </ActivityContext.Provider>
  );
}
