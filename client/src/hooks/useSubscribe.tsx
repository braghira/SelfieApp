import { usePushContext } from "@/context/NotificationContext";
import { client_log, urlBase64ToUint8Array } from "@/lib/utils";
import api from "@/lib/axios";
import { useState } from "react";

export default function useSubscribe() {
  const [loading, setLoading] = useState(false);
  const { subscription, dispatch } = usePushContext();

  /**
   * Subscribe this device to Push Notification service
   * @param _id ID of current user
   */
  async function subscribe(_id: string) {
    // Check if the user is already subscribed
    if (subscription) {
      console.log("User is already subscribed:", subscription);
    } else {
      // If not subscribed, subscribe the user
      try {
        setLoading(true);

        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            import.meta.env.VITE_VAPID_PUBLIC_KEY
          ),
        });

        const payload = { subscription: sub, _id };

        client_log("payload: ", payload);
        // Send the subscription to the server
        await api.post("/auth/subscribe", JSON.stringify(payload));
        dispatch({ type: "SUB", payload: { sub } });

        console.log("User is subscribed:", sub);
      } catch (error) {
        console.error("Failed to subscribe the user: ", error);
      } finally {
        setLoading(false);
      }
    }
  }

  return { subscribe, loading };
}
