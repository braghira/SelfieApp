import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as z from "zod";

const recurrencePatternSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  endType: z.enum(['never', 'after', 'until']).optional(),
  occurrences: z.number().optional(),
  endDate: z.string().optional(), 
});

export const EventSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  date: z.string(), 
  duration: z.number().nonnegative(),
  location: z.string().optional(),
  isRecurring: z.boolean(),
  recurrencePattern: recurrencePatternSchema.optional(),
  _id: z.string().optional(),
  createdAt: z.string().optional(),
});
export type EventType = z.infer<typeof EventSchema>;

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
 * @param time in milliseconds
 * @returns equivalent time in a HH:MM:SS string format
 */
export function msToTime(time: number): string {
  // Pad to 2 or 3 digits, default is 2
  function pad(n: number, z: number = 2) {
    return ("00" + n).slice(-z);
  }

  const ms = time % 1000;
  time = (time - ms) / 1000;
  const secs = time % 60;
  time = (time - secs) / 60;
  const mins = time % 60;
  const hrs = (time - mins) / 60;

  return pad(hrs) + ":" + pad(mins) + ":" + pad(secs);
}

/**
 *
 * @param time time in HH:MM:SS string format
 * @returns equivalent time in milliseconds
 */
export function timeToMs(time: string): number {
  function pad(n: number, z: number = 1) {
    return ("00" + n).slice(-z);
  }

  const secs = parseInt(time.slice(-2));
  console.log("sec: ", time.slice(-2));
  time = time.slice(0, 5);

  const mins = parseInt(time.slice(-2));
  console.log("mins: ", time.slice(-2));
  time = time.slice(0, 2);

  const hrs = parseInt(time);
  console.log("hrs: ", time.slice(-2));

  const totsec = secs + mins * 60 + hrs * 60 * 60;

  return 1000 * totsec;
}

/**
 * Merges the inputs classes
 * @param inputs tailwind classes
 * @returns tailwind merge string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
