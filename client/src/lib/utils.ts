import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as z from "zod";

const recurrencePatternSchema = z.object({
  frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  endType: z.enum(["after", "until"]).optional(),
  occurrences: z.number().optional(),
  endDate: z.string().optional(),
});
export type RecurrenceType = z.infer<typeof recurrencePatternSchema>;

/** study and relax timer are in milliseconds */
const PomodoroSchema = z.object({
  study: z.number().optional(),
  relax: z.number().optional(),
  cycles: z.number().optional(),
});

export const EventSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(20),
  date: z.string(),
  isRecurring: z.boolean(),
  location: z.string().optional(),
  author: z.string().optional(),
  recurrencePattern: recurrencePatternSchema.optional(),
  // hours and minutes will be calculated based on total pomodoro session time
  hours: z.number().nonnegative(),
  minutes: z.number().nonnegative(),
  // this field is exclusive to normal events
  groupList: z.string().array().optional().default([]),
  // If it's a pomodoro event, add these 3 fields
  itsPomodoro: z.boolean(),
  currPomodoro: PomodoroSchema.optional(),
  expectedPomodoro: PomodoroSchema.optional(),
  expiredPomodoro: z.boolean(),
  createdAt: z.string().optional(),
  _id: z.string().optional(),
});
export type EventType = z.infer<typeof EventSchema>;

export const ActivitySchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(20),
  endDate: z.string().nullable().optional(),
  groupList: z.string().array(),
  completed: z.boolean(),
  _id: z.string().optional(),
  author: z.string().optional(),
});
export type ActivityType = z.infer<typeof ActivitySchema>;

// TODO: aggiungere campo per le notifiche push
export const UserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { message: "Username must be at least 3 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
  name: z.string().trim().optional(),
  surname: z.string().trim().optional(),
  birthday: z.date().optional(),
  /** Contains the string of the endpoint to get the image based on its ID */
  profilePic: z.string().optional(),
  accessToken: z.string().optional(),
  _id: z.string().optional(),
});
export type UserType = z.infer<typeof UserSchema>;

export const NoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Title must be at least 1 character long." }),
  content: z.string().trim().min(1, { message: "Content cannot be empty." }),
  categories: z.array(z.string().trim()).optional().default([]),
  author: z.string().trim().min(1, { message: "Author is required." }),
  accessType: z.enum(["public", "restricted", "private"]).default("private"),
  specificAccess: z.array(z.string().trim()).optional().default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  _id: z.string().optional(),
});
export type NoteType = z.infer<typeof NoteSchema>;

export const AccountSchema = z
  .object({
    currPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type AccountType = z.infer<typeof AccountSchema>;

export function client_log(message: unknown, ...options: unknown[]) {
  if (import.meta.env.DEV) console.log(message, ...options);  //available in DEV, not i PROD for debugging
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

export async function getPushSub() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription;
}

/**
 * Merges the inputs classes
 * @param inputs tailwind classes
 * @returns tailwind merge string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
