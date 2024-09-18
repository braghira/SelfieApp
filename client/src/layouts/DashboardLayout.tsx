import Navbar from "@/components/Navbar";
import usePushNotification from "@/hooks/usePushNotification";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  // redirects to notification url
  usePushNotification();

  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default DashboardLayout;
