import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const lessonTypeMapping: { [key: string]: string } = {
  "LEC": "Lecture",
  "LAB": "Laboratory",
  "TUT": "Tutorial",
  "SEM": "Seminar-Style Module Class",
  // Add more mappings as needed
};

// Function to convert lesson type
export function convertLessonType(lessonType: string): string {
  return lessonTypeMapping[lessonType] || lessonType; // Return the original string if no mapping is found
};

// Function to reverse lesson type
export function reverseLessonType(lessonType: string): string {
  return Object.keys(lessonTypeMapping).find(key => lessonTypeMapping[key] === lessonType) || lessonType; // Return the original string if no mapping is found
};

// To parse semesterdata into and object
export function parseFunc(input: string): unknown {
  try {
    const sanitised = input.replace(/'/g, '"');
    const parsedData = JSON.parse(sanitised);
    return parsedData;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return "";
  }
};

export function convertToHour(time: string): number {
  return parseInt(time.slice(0, 2));  
}

export const FIRSTMONDAY = new Date("2025-01-13");