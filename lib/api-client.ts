/**
 * API client utilities for making HTTP requests
 */

import { ApiResponse, ApiError } from "./types";
import { ERROR_MESSAGES } from "./constants";

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  /**
   * Set authorization header
   */
  setAuthToken(token: string) {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  /**
   * Remove authorization header
   */
  removeAuthToken() {
    delete this.defaultHeaders["Authorization"];
  }

  /**
   * Generic HTTP request method
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          response.status.toString(),
          data.message || ERROR_MESSAGES.SERVER_ERROR,
          data,
          Date.now()
        );
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
        meta: data.meta,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new ApiError(
          "NETWORK_ERROR",
          ERROR_MESSAGES.NETWORK_ERROR,
          {},
          Date.now()
        );
      }

      // Handle other errors
      throw new ApiError(
        "UNKNOWN_ERROR",
        ERROR_MESSAGES.GENERIC,
        { originalError: error },
        Date.now()
      );
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params).toString()}` : endpoint;
    return this.request<T>(url, { method: "GET" });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  /**
   * File upload request
   */
  async upload<T = any>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === "string" ? value : JSON.stringify(value));
      });
    }

    // Remove content-type header for file uploads
    const headers = { ...this.defaultHeaders };
    delete headers["Content-Type"];

    return this.request<T>(endpoint, {
      method: "POST",
      body: formData,
      headers,
    });
  }

  /**
   * Download file
   */
  async download(endpoint: string, filename?: string): Promise<Blob> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.defaultHeaders,
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Trigger download if filename is provided
      if (filename) {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }

      return blob;
    } catch (error) {
      throw new ApiError(
        "DOWNLOAD_ERROR",
        `Failed to download file: ${error instanceof Error ? error.message : "Unknown error"}`,
        { endpoint },
        Date.now()
      );
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

/**
 * Specific API endpoints
 */
export const api = {
  // Signals
  signals: {
    list: (params?: any) => apiClient.get("/signals", params),
    get: (id: string) => apiClient.get(`/signals/${id}`),
    create: (data: any) => apiClient.post("/signals", data),
    update: (id: string, data: any) => apiClient.put(`/signals/${id}`, data),
    delete: (id: string) => apiClient.delete(`/signals/${id}`),
    validate: (id: string) => apiClient.post(`/signals/${id}/validate`),
    dismiss: (id: string, reason?: string) => apiClient.post(`/signals/${id}/dismiss`, { reason }),
  },

  // Mentions
  mentions: {
    list: (params?: any) => apiClient.get("/mentions", params),
    get: (id: string) => apiClient.get(`/mentions/${id}`),
    process: (id: string) => apiClient.post(`/mentions/${id}/process`),
    bulkProcess: (ids: string[]) => apiClient.post("/mentions/bulk-process", { ids }),
  },

  // Content
  content: {
    ideas: {
      list: (params?: any) => apiClient.get("/content/ideas", params),
      get: (id: string) => apiClient.get(`/content/ideas/${id}`),
      create: (data: any) => apiClient.post("/content/ideas", data),
      update: (id: string, data: any) => apiClient.put(`/content/ideas/${id}`, data),
      delete: (id: string) => apiClient.delete(`/content/ideas/${id}`),
      generate: (data: any) => apiClient.post("/content/ideas/generate", data),
    },
  },

  // Team
  team: {
    members: {
      list: (params?: any) => apiClient.get("/team/members", params),
      get: (id: string) => apiClient.get(`/team/members/${id}`),
      create: (data: any) => apiClient.post("/team/members", data),
      update: (id: string, data: any) => apiClient.put(`/team/members/${id}`, data),
      delete: (id: string) => apiClient.delete(`/team/members/${id}`),
    },
    activity: (params?: any) => apiClient.get("/team/activity", params),
  },

  // Sources
  sources: {
    list: (params?: any) => apiClient.get("/sources", params),
    get: (id: string) => apiClient.get(`/sources/${id}`),
    create: (data: any) => apiClient.post("/sources", data),
    update: (id: string, data: any) => apiClient.put(`/sources/${id}`, data),
    delete: (id: string) => apiClient.delete(`/sources/${id}`),
    test: (id: string) => apiClient.post(`/sources/${id}/test`),
    collect: (id: string) => apiClient.post(`/sources/${id}/collect`),
  },

  // Analytics
  analytics: {
    dashboard: (params?: any) => apiClient.get("/analytics/dashboard", params),
    signals: (params?: any) => apiClient.get("/analytics/signals", params),
    mentions: (params?: any) => apiClient.get("/analytics/mentions", params),
    team: (params?: any) => apiClient.get("/analytics/team", params),
    export: (data: any) => apiClient.post("/analytics/export", data),
  },

  // Chat
  chat: {
    conversations: {
      list: (params?: any) => apiClient.get("/chat/conversations", params),
      get: (id: string) => apiClient.get(`/chat/conversations/${id}`),
      create: (data: any) => apiClient.post("/chat/conversations", data),
      delete: (id: string) => apiClient.delete(`/chat/conversations/${id}`),
    },
    messages: {
      list: (conversationId: string, params?: any) =>
        apiClient.get(`/chat/conversations/${conversationId}/messages`, params),
      send: (conversationId: string, data: any) =>
        apiClient.post(`/chat/conversations/${conversationId}/messages`, data),
    },
  },

  // Newsletter
  newsletters: {
    list: (params?: any) => apiClient.get("/newsletters", params),
    get: (id: string) => apiClient.get(`/newsletters/${id}`),
    create: (data: any) => apiClient.post("/newsletters", data),
    update: (id: string, data: any) => apiClient.put(`/newsletters/${id}`, data),
    delete: (id: string) => apiClient.delete(`/newsletters/${id}`),
    send: (id: string) => apiClient.post(`/newsletters/${id}/send`),
    preview: (id: string) => apiClient.get(`/newsletters/${id}/preview`),
  },

  // Admin
  admin: {
    controls: {
      get: () => apiClient.get("/admin/controls"),
      update: (data: any) => apiClient.put("/admin/controls", data),
    },
    usage: {
      llm: (params?: any) => apiClient.get("/admin/usage/llm", params),
      system: (params?: any) => apiClient.get("/admin/usage/system", params),
    },
    logs: (params?: any) => apiClient.get("/admin/logs", params),
  },

  // Search
  search: {
    global: (query: string, params?: any) =>
      apiClient.get("/search", { q: query, ...params }),
    signals: (query: string, params?: any) =>
      apiClient.get("/search/signals", { q: query, ...params }),
    mentions: (query: string, params?: any) =>
      apiClient.get("/search/mentions", { q: query, ...params }),
  },

  // Files
  files: {
    upload: (file: File, data?: any) => apiClient.upload("/files/upload", file, data),
    download: (id: string, filename?: string) => apiClient.download(`/files/${id}`, filename),
    delete: (id: string) => apiClient.delete(`/files/${id}`),
  },

  // Export
  exports: {
    create: (data: any) => apiClient.post("/exports", data),
    get: (id: string) => apiClient.get(`/exports/${id}`),
    download: (id: string, filename?: string) => apiClient.download(`/exports/${id}/download`, filename),
    list: (params?: any) => apiClient.get("/exports", params),
  },

  // Notifications
  notifications: {
    list: (params?: any) => apiClient.get("/notifications", params),
    markAsRead: (id: string) => apiClient.post(`/notifications/${id}/read`),
    markAllAsRead: () => apiClient.post("/notifications/mark-all-read"),
    delete: (id: string) => apiClient.delete(`/notifications/${id}`),
  },
};

export default api;