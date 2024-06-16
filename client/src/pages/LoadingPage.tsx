import { useAuth } from "@/context/AuthContext";
import loader from "../assets/loader.svg";
import { Outlet } from "react-router-dom";

export default function LoadingPage() {
  const { loading } = useAuth();

  return loading ? (
    <div className="w-screen h-screen flex-center flex-col gap-6">
      <img
        src={loader}
        width={24}
        height={24}
        className="animate-spin h-48 w-48 bg-primary rounded-full"
      />
      <div className="base-regular">LOADING...</div>
    </div>
  ) : (
    <Outlet />
  );
}
