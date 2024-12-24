"use client";

// Shared API utilities
export function handleApiError(error: unknown, context: string): void {
  if (error instanceof Error) {
    console.error(`${context}:`, error.message);
  } else {
    console.error(`${context}:`, error);
  }
}

export async function fetchWithTimeout(
  url: string, 
  options: RequestInit = {}, 
  timeout = 5000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}