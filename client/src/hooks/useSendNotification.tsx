import api from "@/lib/axios";
import { useState } from "react";

export type NotificationPayload = {
  title: string; // notification title
  body: string; // body of the notification
  url: string; // url to go to when clicking notification
};

export default function useSendNotification() {
  const [loading, setIsLoading] = useState(false);

  /**
   * Sends a Push Notification to a specific user
   * @param _id Id of destination user
   * @param payload Notification payload comprised of title, body and an URL link
   */
  async function sendNotification(_id: string, payload: NotificationPayload) {
    try {
      setIsLoading(true);

      // Send notification to server
      const response = await api.post("/auth/sendNotification", {
        ...payload,
        _id,
      });

      if (response.status === 200) {
        console.log("Notification sent successfully");
      } else {
        throw new Error("Failed to send notification");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  return { sendNotification, loading };
}
