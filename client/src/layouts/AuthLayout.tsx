// images
import Background from "@/assets/background.jpg";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen xl:h-screen">
      <div className="hidden bg-black xl:flex xl:w-1/2">
        <img
          src={Background}
          alt="background image"
          className="w-full h-full object-cover"
        />
      </div>
      <Outlet />
    </div>
  );
}
