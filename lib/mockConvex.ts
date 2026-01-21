// Mock Convex hooks for standalone frontend

import { useMockQuery, useMockMutation, mockApi } from './mockData';

// Replace useQuery with mock implementation
export function useQuery(endpoint: string, args?: any) {
  return useMockQuery(endpoint, args);
}

// Replace useMutation with mock implementation
export function useMutation(endpoint: string) {
  return useMockMutation(endpoint);
}

// Export mock api
export const api = mockApi;