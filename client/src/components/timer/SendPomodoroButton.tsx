import usePushNotification, {
  NotificationPayload,
} from "@/hooks/usePushNotification";
import { PomodoroType } from "@/hooks/useTimer";

export default function SendPomodoroButton() {
  const { RequestPushSub, sendNotification, sendLoading } =
    usePushNotification();

  function handleSendNotification() {
    const session: PomodoroType = {
      cycles: 3,
      isStudyCycle: true,
      relax: { value: 150000, initialValue: 150000, started: false },
      study: { value: 200000, initialValue: 200000, started: false },
      totalTime: 3 * (150000 + 200000),
    };

    const payload: NotificationPayload = {
      title: "Push Test",
      body: "Is this thing On?",
      url: "/pomodoro",
      pomodoro: session,
    };
    // send to bowser
    RequestPushSub(() => sendNotification("66d1e784cd5434101ea33e08", payload));
  }

  return <></>;
}
