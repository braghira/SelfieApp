import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import UsersSearchBar from "@/components/UsersSearchBar";
import usePushNotification, {
  NotificationPayload,
} from "@/hooks/usePushNotification";
import { PomodoroType } from "@/hooks/useTimer";
import { UserType } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function Home() {
  const [userList, setUsersList] = useState<UserType[]>([]);
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
      url: `/pomodoro`,
      pomodoro: session,
    };
    // send to bowser
    RequestPushSub(() => sendNotification("66d1e784cd5434101ea33e08", payload));
  }

  useEffect(() => {
    console.log("Selected Users", userList);
  }, [userList]);

  return (
    <div className="view-container">
      <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-6">
            <UsersSearchBar userList={userList} setUsersList={setUsersList} />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={75}>
              <div className="flex h-[200px] items-center justify-center p-6">
                <Button onClick={handleSendNotification}>
                  {sendLoading ? <Loader /> : "sendPush"}
                </Button>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={25}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold">Three</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}