import logo from "../assets/trace.svg";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size: "sm" | "md" | "lg";
}

export default function Logo({ className, size }: LogoProps) {
  const sizes = [69, 111, 154];

  const i: number = findSize();

  function findSize() {
    switch (size) {
      case "sm":
        return 0;
      case "md":
        return 1;
      case "lg":
        return 2;
    }
  }

  return (
    <div className={cn("flex-center gap-1", className)}>
      <img
        src={logo}
        alt="logo"
        className="rounded-full"
        style={{ height: `${sizes[i]}px` }}
      />
      <div
        className="font-logo italic"
        style={{ fontSize: `${sizes[i] / 2.38}px` }}
      >
        Selfie
      </div>
    </div>
  );
}
