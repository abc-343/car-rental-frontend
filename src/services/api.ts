import axios from 'axios';
import type { ApiErrorResponse } from '../types/api';

// Base URL of the Spring Boot API, set in the .env file
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default api;

// Turns any error from axios into a message we can show to the user
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) {
      return 'Could not reach the server. Check your connection and try again.';
    }
    if (error.response.data?.message) {
      return error.response.data.message;
    }
    return `Request failed with status ${error.response.status}`;
  }
  return 'Something went wrong.';
}

// Validation errors per field (only sent when the backend returns 400 "Validation failed")
export function getFieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError<ApiErrorResponse>(error) && error.response?.data?.fieldErrors) {
    return error.response.data.fieldErrors;
  }
  return {};
}
