import { usePushContext } from "@/context/NotificationContext";
import api from "@/lib/axios";
import { useState } from "react";

export default function useUnsubscribe() {
  const [loading, setLoading] = useState(false);
  const { subscription, dispatch } = usePushContext();

  /**
   * Unsubscribe this device from Push Notification service
   * @param _id ID of current user
   */
  async function unsubscribe(_id: string) {
    try {
      if (subscription) {
        setLoading(true);

        await subscription.unsubscribe();
        console.log("User unsubscribed successfully");

        // Notify server to update the subscription status
        await api.post("/auth/unsubscribe", {
          _id,
          subscription: subscription.toJSON(),
        });

        dispatch({ type: "UNSUB", payload: { sub: null } });

        console.log("subscription removed from server");
      } else {
        console.log("No subscription found");
      }
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
    } finally {
      setLoading(false);
    }
  }

  return { unsubscribe, loading };
}
