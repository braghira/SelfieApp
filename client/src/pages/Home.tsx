import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import useSendNotification, {
  NotificationPayload,
} from "@/hooks/useSendNotification";

export default function Home() {
  const { loading, sendNotification } = useSendNotification();

  function handleSendNotification() {
    const payload: NotificationPayload = {
      title: "Push Test",
      body: "Is this thing On?",
      url: `http://localhost:5173/home`,
    };

    // send to bowser
    sendNotification("66d1e784cd5434101ea33e08", payload);
  }

  return (
    <div className="view-container">
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full rounded-lg border"
      >
        <ResizablePanel defaultSize={50}>
          <div className="flex h-[200px] items-center justify-center p-6">
            <Button onClick={handleSendNotification}>
              {loading ? <Loader /> : "sendPush"}
            </Button>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={25}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold">Two</span>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={75}>
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
