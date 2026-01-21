/**
 * Custom React hooks for common functionality
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import { api } from "./api-client";
import { ApiResponse, SearchQuery, FormState } from "./types";
import { SEARCH_CONFIG, REFRESH_INTERVALS } from "./constants";

/**
 * Hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for local storage with SSR safety
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * Hook for copying text to clipboard
 */
export function useClipboard(): {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
} {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      console.warn("Failed to copy:", error);
      return false;
    }
  }, []);

  return { copy, copied };
}

/**
 * Hook for async operations with loading state
 */
export function useAsync<T, Args extends any[]>(
  asyncFn: (...args: Args) => Promise<T>
): {
  execute: (...args: Args) => Promise<T | undefined>;
  data: T | null;
  loading: boolean;
  error: Error | null;
  reset: () => void;
} {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await asyncFn(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Unknown error");
        setState({ data: null, loading: false, error: err });
        return undefined;
      }
    },
    [asyncFn]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { execute, ...state, reset };
}

/**
 * Hook for search functionality with debouncing
 */
export function useSearch<T>(
  searchFn: (query: SearchQuery) => Promise<ApiResponse<T[]>>,
  initialQuery: SearchQuery = { query: "" }
): {
  query: SearchQuery;
  setQuery: (query: SearchQuery) => void;
  results: T[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  total: number;
} {
  const [query, setQuery] = useState<SearchQuery>(initialQuery);
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const debouncedQuery = useDebounce(query, SEARCH_CONFIG.DEBOUNCE_DELAY);

  useEffect(() => {
    if (!debouncedQuery.query || debouncedQuery.query.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      setResults([]);
      setHasMore(false);
      setTotal(0);
      return;
    }

    const search = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await searchFn(debouncedQuery);
        setResults(response.data || []);
        setHasMore(response.meta?.hasMore || false);
        setTotal(response.meta?.total || 0);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Search failed");
        setError(error);
        setResults([]);
        setHasMore(false);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery, searchFn]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    hasMore,
    total,
  };
}

/**
 * Hook for form state management
 */
export function useForm<T extends Record<string, any>>(
  initialData: T,
  onSubmit: (data: T) => Promise<void>,
  validate?: (data: T) => Partial<Record<keyof T, string>>
): FormState<T> & {
  setData: (data: Partial<T>) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
} {
  const [data, setDataState] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const setData = useCallback((newData: Partial<T>) => {
    setDataState(prev => ({ ...prev, ...newData }));
    setIsDirty(true);
  }, []);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      if (validate) {
        const validationErrors = validate(data);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
          return;
        }
      }

      setIsSubmitting(true);
      try {
        await onSubmit(data);
        setIsDirty(false);
        toast.success("Form submitted successfully");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Form submission failed";
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [data, onSubmit, validate]
  );

  const reset = useCallback(() => {
    setDataState(initialData);
    setErrors({});
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialData]);

  return {
    data,
    setData,
    errors,
    setErrors,
    isSubmitting,
    isDirty,
    isValid,
    handleSubmit,
    reset,
  };
}

/**
 * Hook for infinite scroll/pagination
 */
export function usePagination<T>(
  fetchFn: (page: number, limit: number) => Promise<ApiResponse<T[]>>,
  initialLimit: number = 20
): {
  items: T[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  total: number;
} {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadData = useCallback(
    async (pageNum: number, reset = false) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchFn(pageNum, initialLimit);
        const newItems = response.data || [];

        if (reset) {
          setItems(newItems);
        } else {
          setItems(prev => [...prev, ...newItems]);
        }

        setHasMore(response.meta?.hasMore || false);
        setTotal(response.meta?.total || 0);
        setPage(pageNum);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to load data");
        setError(error);
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, initialLimit]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadData(page + 1);
    }
  }, [loading, hasMore, page, loadData]);

  const refresh = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    loadData(1, true);
  }, [loadData]);

  useEffect(() => {
    loadData(1, true);
  }, [loadData]);

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    total,
  };
}

/**
 * Hook for auto-refresh with visibility detection
 */
export function useAutoRefresh(
  refreshFn: () => void,
  interval: number = REFRESH_INTERVALS.SIGNALS,
  enabled: boolean = true
) {
  const intervalRef = useRef<NodeJS.Timeout>();
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    const startInterval = () => {
      intervalRef.current = setInterval(() => {
        if (isVisibleRef.current) {
          refreshFn();
        }
      }, interval);
    };

    startInterval();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshFn, interval, enabled]);
}

/**
 * Hook for detecting when element is in viewport
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return [elementRef, isIntersecting];
}

/**
 * Hook for managing modal/dialog state
 */
export function useModal(initialOpen: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}

/**
 * Hook for previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}