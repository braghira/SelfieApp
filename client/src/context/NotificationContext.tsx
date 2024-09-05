import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { useAuth } from "./AuthContext";
import { client_log, urlBase64ToUint8Array } from "@/lib/utils";
import api from "@/lib/axios";

export type PushType = PushSubscription | null;

// types for the reducer
export type PushActionType = {
  type: "SUB" | "UNSUB";
  payload: { sub: PushType };
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
      return action.payload.sub;
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
  const { user } = useAuth();

  useEffect(() => {
    // Check if Notification API and Service Worker are supported
    if ("Notification" in window && navigator.serviceWorker) {
      Notification.requestPermission()
        .then(async (permission) => {
          if (permission === "granted") {
            // Check if the user is already subscribed by checking service worker directly
            const registration = await navigator.serviceWorker.ready;
            const existingSubscription =
              await registration.pushManager.getSubscription();

            if (existingSubscription) {
              console.log("User is already subscribed:", existingSubscription);
              dispatch({ type: "SUB", payload: { sub: existingSubscription } });
            } else {
              try {
                const reg = await navigator.serviceWorker.ready;
                const sub = await reg.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(
                    import.meta.env.VITE_VAPID_PUBLIC_KEY
                  ),
                });

                const payload = { subscription: sub, _id: user?._id };

                client_log("payload: ", payload);
                // Send the subscription to the server
                await api.post("/auth/subscribe", JSON.stringify(payload));
                dispatch({ type: "SUB", payload: { sub } });

                console.log("User is subscribed:", sub);
              } catch (error) {
                console.error("Failed to subscribe the user: ", error);
              }
            }
          }
        })
        .catch((err) => console.error("Permission request error:", err));
    }
  }, []);

  return (
    <PushContext.Provider value={{ subscription: state, dispatch }}>
      {children}
    </PushContext.Provider>
  );
}
