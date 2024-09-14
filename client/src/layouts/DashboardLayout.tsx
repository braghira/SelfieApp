import Navbar from "@/components/Navbar";
import usePushNotification from "@/hooks/usePushNotification";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  // redirects to notification url
  usePushNotification();

  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
