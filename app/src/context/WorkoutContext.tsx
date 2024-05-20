import { ReactElement, createContext, useReducer } from "react";
import { WorkoutType } from "@/lib/utils";

// types for the reducer
export type ActionType = {
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
  console.log("state: ", state);
  console.log("payload: ", action.payload);
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

export const WorkoutContext = createContext<WorkoutContextType>(undefined);

interface WorkoutContextProps {
  children: ReactElement | ReactElement[] | undefined;
}

export function WorkoutContextProvider({ children }: WorkoutContextProps) {
  const [state, dispatch] = useReducer(workoutsReducer, []);

  return (
    <WorkoutContext.Provider value={{ workouts: state, dispatch: dispatch }}>
      {children}
    </WorkoutContext.Provider>
  );
}
