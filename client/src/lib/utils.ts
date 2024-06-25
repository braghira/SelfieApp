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

// TODO: aggiungere campo per la foto profilo
export const UserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { message: "Username must be at least 3 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
  email: z.string().email().optional(),
  name: z.string().trim().optional(),
  surname: z.string().trim().optional(),
  birthday: z.date().optional(),
  /** Contains the string of the endpoint to get the image based on its ID */
  profilePic: z.string().optional(),
  accessToken: z.string().optional(),
  _id: z.string().optional(),
});
export type UserType = z.infer<typeof UserSchema>;

export function client_log(message: unknown, ...options: unknown[]) {
  if (import.meta.env.DEV) console.log(message, ...options);
}

/**
 * Merges the inputs classes
 * @param inputs tailwind classes
 * @returns tailwind merge string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
