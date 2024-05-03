import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export type Workout = {
    title: string;
    reps: number;
    load: number;
    _id?: string;
    createdAt?: string
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
