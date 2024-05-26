import { UserType } from "@/lib/utils";
import { ReactElement, createContext, useReducer } from "react";

type AuthType = UserType | undefined;

// types for the reducer
export type ActionType = {
  type: "LOGIN" | "LOGOUT";
  payload: AuthType;
};

export type AuthContextType =
  | {
      user: AuthType;
      dispatch: React.Dispatch<ActionType>;
    }
  | undefined;

export const AuthContext = createContext<AuthContextType>(undefined);

/**
 *
 * @param state stato attuale dello User
 * @param action azione da compiere sullo stato
 * @returns il nuovo User
 */
function authReducer(state: AuthType, action: ActionType): AuthType {
  switch (action.type) {
    case "LOGIN":
      return action.payload;
    case "LOGOUT":
      return undefined;
    default:
      return state;
  }
}

interface AuthContextProps {
  children: ReactElement | ReactElement[] | undefined;
}

export function AuthContextProvider({ children }: AuthContextProps) {
  const [state, dispatch] = useReducer(authReducer, undefined);

  console.log("AuthContext state: ", state);

  return (
    <AuthContext.Provider value={{ user: state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}
