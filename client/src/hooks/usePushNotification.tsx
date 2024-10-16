import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import useAxiosPrivate from "./useAxiosPrivate";
import { client_log, getPushSub } from "@/lib/utils";
import { usePushContext } from "@/context/NotificationContext";
import { PomodoroType } from "./useTimer";

export type NotificationPayload = {
  title: string; // notification title
  body: string; // body of the notification
  url: string; // data containing url to get to when clicking, and a PomodoroTimer session if needed
  pomodoro?: PomodoroType;
};

export default function usePushNotification() {
  const [sendLoading, setSendLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [unsubLoading, setUnsubLoading] = useState(false);
  const private_api = useAxiosPrivate();
  const { user } = useAuth();
  const { dispatch } = usePushContext();

  const notificationsSupported = () =>
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  /**
   * @returns service worker registration
   */
  async function registerServiceWorker() {
    return navigator.serviceWorker.register("/service-worker.js");
  }

  /**
   * Deletes all service workers
   */
  // async function unregisterServiceWorkers() {
  //   const registrations = await navigator.serviceWorker.getRegistrations();
  //   await Promise.all(registrations.map((r) => r.unregister()));
  // }

  /**
   * Subscribes user to push notifications service with Push Manager and saves the sub on the server
   * IF not yet subscribed
   * @param _id user id
   */
  async function subscribe(_id: string | undefined) {
    if (Notification.permission === "granted") {
      setSubLoading(true);

      try {
        const options = {
          applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
          userVisibleOnly: true,
        };

        const swRegistration = await navigator.serviceWorker.ready;

        // subscribe to push notifications with push manager
        const newSubscription = await swRegistration.pushManager.subscribe(
          options
        );

        // little check since _id property of user can be undefined
        if (_id === undefined) throw Error("User id provided is undefined");

        const payload = { subscription: newSubscription, _id };
        client_log("payload: ", payload);

        // Send the subscription to the server
        const response = await private_api.post(
          "/auth/subscribe",
          JSON.stringify(payload)
        );

        // update push context
        if (response.status === 201) {
          dispatch({ type: "SUB", payload: newSubscription });
          client_log("Successfully subscribed to push service");
        } else {
          client_log("Push response code: ", response.status);
        }
      } catch (err) {
        console.error("Error", err);
      } finally {
        setSubLoading(false);
      }
    }
    // }
  }

  /**
   * Unsubscribe this user device from Push Notification service
   * @param _id ID of current user
   */
  async function unsubscribe(_id: string) {
    try {
      setUnsubLoading(true);

      // get current Push Manager subscription
      const subscription = await getPushSub();

      if (subscription) {
        // update local state
        await subscription.unsubscribe();

        // Notify server to update the push subscriptions of this user
        const response = await private_api.post("/auth/unsubscribe", {
          _id,
          subscription: subscription.toJSON(),
        });

        if (response.status === 200) {
          dispatch({ type: "UNSUB", payload: null });
          console.log(response.data);
        }
      } else {
        console.log("No subscription found for this user");
      }
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
    } finally {
      setUnsubLoading(false);
    }
  }

  /**
   * Sends a Push Notification to a specific user
   * @param _id Id of destination user
   * @param payload Notification payload comprised of title, body and an URL link
   */
  async function sendNotification(_id: string, payload: NotificationPayload) {
    try {
      setSendLoading(true);

      // Send notification to server
      const response = await private_api.post("/auth/sendNotification", {
        ...payload,
        _id,
      });

      if (response.status === 202) {
        console.log(response.data);
        subscribe(_id);
        sendNotification(_id, payload);
      } else if (response.status === 200) {
        console.log(response.data);
      } else {
        throw new Error("Failed to send notification");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setSendLoading(false);
    }
  }

  /**
   * Requests permission to activate push notification service to the user if supported from the browser.
   * When granted permission it subscribes the user to the push manager api and saves subscription on DB
   */
  async function RequestPushSub(callback: () => Promise<void>) {
    if (!user) return;
    if (!notificationsSupported()) return;

    // request permission if not granted yet
    switch (Notification.permission) {
      case "default":
        Notification.requestPermission().then((permission) => {
          if (user && permission === "granted") {
            registerServiceWorker().then(() => {
              // subscribe the user
              subscribe(user._id).then(() => {
                // the callback function should not call subscribe method twice
                if (callback !== subscribe) callback();
              });
            });
          }

          if (Notification.permission === "denied") {
            window.alert("Allow push Notifications to use this feature.");
          }
        });

        break;

      case "denied":
        window.alert(
          "Allow push Notifications to use this feature properly. Notifications will be sent anyway."
        );
        callback();

        break;

      case "granted":
        callback();

        break;

      default:
        break;
    }
  }

  return {
    sendNotification,
    RequestPushSub,
    subscribe,
    unsubscribe,
    sendLoading,
    subLoading,
    unsubLoading,
  };
}
