import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as z from "zod";

export const WorkoutSchema = z.object({
  title: z.string().min(2),
  reps: z.number().nonnegative(),
  load: z.number().nonnegative(),
  _id: z.string().optional(),
  createdAt: z.string().optional(),
});
export type WorkoutType = z.infer<typeof WorkoutSchema>;

export const UserSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
  name: z.string().min(2).optional(),
  username: z.string().min(2).optional(),
});
export type UserType = z.infer<typeof UserSchema>;

// tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
