import Navbar from "@/components/Navbar";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
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
