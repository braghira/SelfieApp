import useRefreshToken from "@/hooks/useRefreshToken";
import { UserType } from "@/lib/utils";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";

type AuthType =
  | (UserType & {
      accessToken: string;
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
      setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    }
  | undefined;

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

const AuthContext = createContext<AuthContextType>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw Error("useAuthContext must be used inside an AuthContextProvider");
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
        if (user?.data) {
          const userWithToken: AuthType = {
            email: user.data?.email,
            password: user.data.password,
            accessToken: user.accessToken,
          };
          dispatch({ type: "LOGIN", payload: userWithToken });
          setLoading(false);
        }
      } catch (error) {
        console.error("Couldn't get new access token");
      }
      setLoading(false);
    };

    // if access token doesn't exist already
    !state?.accessToken ? verifyRefreshToken() : setLoading(false);
  }, []);

  console.log("AuthContext state: ", state);

  return (
    <AuthContext.Provider
      value={{ user: state, dispatch, loading, setLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
