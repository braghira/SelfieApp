import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

interface CircleProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  timer: number;
}

const CircleProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  CircleProgressProps
>(({ className, value, timer, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      `relative overflow-hidden rounded-full flex justify-center items-center bg-custom-gradient`,
      className
    )}
    {...props}
    style={{ "--pomodoro-gradient-value": `${value}%` } as React.CSSProperties}
  >
    <div className="pulse">
      <span></span>
      <span></span>
      <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        {timer}
      </div>
    </div>
  </ProgressPrimitive.Root>
));

export { Progress, CircleProgress };
