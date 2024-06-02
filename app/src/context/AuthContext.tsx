import { UserType } from "@/lib/utils";
import {
  PropsWithChildren,
  createContext,
  useEffect,
  useReducer,
  useState,
} from "react";

type AuthType =
  | (UserType & {
      token: string;
    })
  | undefined;

// types for the reducer
export type ActionType = {
  type: "LOGIN" | "LOGOUT";
  payload: AuthType;
};

export type AuthContextType =
  | {
      user: AuthType;
      dispatch: React.Dispatch<ActionType>;
      loading: boolean;
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

export function AuthContextProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(authReducer, undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const item = localStorage.getItem("user");
    if (item) {
      const user: AuthType = JSON.parse(item);
      if (user) {
        dispatch({ type: "LOGIN", payload: user });
      } else {
        console.log("Null user Logged in!");
      }
    }
    setLoading(false);
  }, []);

  console.log("AuthContext state: ", state);

  return (
    <AuthContext.Provider value={{ user: state, dispatch, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
