import {
  createContext,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";

export type PushType = PushSubscription | null;

// types for the reducer
export type PushActionType = {
  type: "SUB" | "UNSUB";
  payload: PushType;
};

export type PushContextType =
  | {
      subscription: PushType;
      dispatch: React.Dispatch<PushActionType>;
    }
  | undefined;

/**
 * Reducer for Push Notification Context
 * @param state Current subscription state for this device
 * @param action reducer action
 * @returns updated subscription state
 */
function pushReducer(state: PushType, action: PushActionType) {
  switch (action.type) {
    case "SUB":
      return action.payload;
    case "UNSUB":
      return null;
    default:
      return state;
  }
}

const PushContext = createContext<PushContextType>(undefined);

export function usePushContext() {
  const context = useContext(PushContext);

  if (!context) {
    throw Error("usePushContext must be used inside an AuthContextProvider");
  }

  return context;
}

/**
 * Push notifications context provider.
 * Saves current push notification service subscription for this device
 * @requires AuthContexProvider as parent
 */
export function NotificationContextProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(pushReducer, null);

  return (
    <PushContext.Provider value={{ subscription: state, dispatch }}>
      {children}
    </PushContext.Provider>
  );
}
