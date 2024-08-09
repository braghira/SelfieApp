import { type ClassValue, clsx } from "clsx";
import * as z from "zod"
import { twMerge } from "tailwind-merge";

export interface Event {
  title: string;
  date: string; // Usare stringa ISO per rappresentare la data
  duration: number;
  location: string;
  isRecurring: boolean;
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly'; 
    endType?: 'never' | 'after' | 'until';
    occurrences?: number; 
    endDate?: string; // Usare stringa ISO per rappresentare la data
  };
  _id?: string;
  createdAt?: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SignupValidation = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});
export const SigninValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});
