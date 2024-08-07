import logo from "../assets/trace.svg";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex-center gap-1", className)}>
      <img
        src={logo}
        alt="logo"
        className="h-[89px] rounded-full sm:h-[154px]"
      />
      <div className="logo-italic">Selfie</div>
    </div>
  );
}
