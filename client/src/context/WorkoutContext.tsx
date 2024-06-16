import { ReactElement, createContext, useContext, useReducer } from "react";
import { WorkoutType, client_log } from "@/lib/utils";

// types for the reducer
type ActionType = {
  type: "SET_WORKOUTS" | "CREATE_WORKOUT" | "DELETE_WORKOUT";
  payload: WorkoutType[];
};

export type WorkoutContextType =
  | {
      workouts: WorkoutType[];
      dispatch: React.Dispatch<ActionType>;
    }
  | undefined;

// definiamo qui le azioni possibili sul contesto
function workoutsReducer(
  state: WorkoutType[],
  action: ActionType
): WorkoutType[] {
  client_log("state: ", state);
  client_log("payload: ", action.payload);
  switch (action.type) {
    case "SET_WORKOUTS":
      // potrebbero non esserci documenti nel database, in quel caso il backend restituisce un array vuoto
      return action.payload;
    case "CREATE_WORKOUT":
      if (Array.isArray(state)) return [...action.payload, ...state];
      else return action.payload;
    case "DELETE_WORKOUT":
      return state.filter((workout) => workout._id !== action.payload[0]._id);
    default:
      throw Error("action selected is not defined");
  }
}

const WorkoutContext = createContext<WorkoutContextType>(undefined);

export function useWorkouts() {
  const context = useContext(WorkoutContext);

  if (!context) {
    throw Error(
      "useWorkoutContext must be used inside a WorkoutContextProvider"
    );
  }

  return context;
}

interface WorkoutContextProps {
  children: ReactElement | ReactElement[] | undefined;
}

export function WorkoutContextProvider({ children }: WorkoutContextProps) {
  const [state, dispatch] = useReducer(workoutsReducer, []);

  return (
    <WorkoutContext.Provider value={{ workouts: state, dispatch }}>
      {children}
    </WorkoutContext.Provider>
  );
}
