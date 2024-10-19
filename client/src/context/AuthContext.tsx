import useRefreshToken from "@/hooks/useRefreshToken.tsx";
import { UserType, client_log } from "@/lib/utils";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";

type AuthType = UserType | undefined;

// types for the reducer
export type AuthActionType = {
  type: "LOGIN" | "LOGOUT";
  payload: AuthType;
};

export type AuthContextType =
  | {
      user: AuthType;
      dispatch: React.Dispatch<AuthActionType>;
      loading: boolean;
      setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    }
  | undefined;

/**
 *
 * @param state stato attuale dello User
 * @param action azione da compiere sullo stato
 * @returns il nuovo User
 */
function authReducer(state: AuthType, action: AuthActionType): AuthType {
  switch (action.type) {
    case "LOGIN":
      if (action.payload?.birthday)
        action.payload.birthday = new Date(action.payload?.birthday);
      return action.payload;
    case "LOGOUT":
      return undefined;
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw Error("useAuth must be used inside an AuthContextProvider");
  }

  return context;
}

export function AuthContextProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(authReducer, undefined);
  const [loading, setLoading] = useState(true);
  const { refresh } = useRefreshToken();

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        const user = await refresh();
        if (user === "expired") {
          dispatch({ type: "LOGOUT", payload: undefined });
        } else {
          dispatch({ type: "LOGIN", payload: user });

          client_log("user: ", user);
        }

        setLoading(false);
      } catch (error) {
        client_log("Couldn't get new access token");
      } finally {
        setLoading(false);
      }
    };

    // if access token doesn't exist already
    !state?.accessToken ? verifyRefreshToken() : setLoading(false);
  }, []); // check if the user is still logged only when component initially renders

  return (
    <AuthContext.Provider
      value={{ user: state, dispatch, loading, setLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
