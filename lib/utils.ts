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
