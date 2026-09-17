import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

// Get full image URL from relative path
export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';

    // If already a full URL (http/https), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Otherwise, construct URL with API base (remove /api from end)
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const BASE_URL = API_BASE.replace('/api', '');

    // Remove leading slash from path if exists
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    return `${BASE_URL}${cleanPath}`;
};
