import logo from "../assets/trace.svg";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex-center gap-3", className)}>
      <div className="sm:logo-italic-l logo-italic-sm">Selfie</div>
      <img
        src={logo}
        alt="logo"
        className="sm:h-[154px] h-[96px] rounded-full"
      />
    </div>
  );
}
