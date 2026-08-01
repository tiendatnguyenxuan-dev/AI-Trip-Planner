import axios from 'axios';
import type {
  TripResponse,
  ItineraryResponse,
  GenerateResponse,
  CreateTripRequest,
  GenerateRequest,
  RegenerateRequest,
  ActivityResponse,
  ActivityCandidateResponse,
  ActivityRequest,
  ActivityUpdateRequest,
  ShareContentRequest,
  SharedContentResponse,
  CommentResponse,
  ExploreItem,
  AdminUserResponse,
} from '../types/trip';

// Base API client pointing at Spring Boot backend
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api/v1',
  withCredentials: true,
});

// Add interceptor to include JWT token in requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add interceptor to handle 401 Unauthorized globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { token: newToken, user: newUser } = response.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ── Trip endpoints ──────────────────────────────────────────────────────────

export const tripApi = {
  getAll: (userId: string): Promise<TripResponse[]> =>
    apiClient.get(`/trips/user/${userId}`).then(r => r.data),

  getById: (tripId: string): Promise<TripResponse> =>
    apiClient.get(`/trips/${tripId}`).then(r => r.data),

  create: (body: CreateTripRequest): Promise<TripResponse> =>
    apiClient.post('/trips', body).then(r => r.data),

  generate: (tripId: string, body?: GenerateRequest): Promise<GenerateResponse> =>
    apiClient.post(`/trips/${tripId}/generate`, body ?? {}).then(r => r.data),

  regenerate: (tripId: string, body?: RegenerateRequest): Promise<GenerateResponse> =>
    apiClient.post(`/trips/${tripId}/regenerate`, body ?? {}).then(r => r.data),

  getCandidates: (tripId: string): Promise<ActivityCandidateResponse[]> =>
    apiClient.get(`/trips/${tripId}/candidates`).then(r => r.data),

  finalize: (tripId: string, activityIds: string[]): Promise<TripResponse> =>
    apiClient.post(`/trips/${tripId}/finalize`, { activityIds }).then(r => r.data),
};

// ── Itinerary endpoints ─────────────────────────────────────────────────────

export const itineraryApi = {
  getByTrip: (tripId: string): Promise<ItineraryResponse[]> =>
    apiClient.get(`/trips/${tripId}/itineraries`).then(r => r.data),

  regenerateDay: (tripId: string, itineraryId: string, body?: RegenerateRequest): Promise<ItineraryResponse> =>
    apiClient.post(`/trips/${tripId}/itineraries/${itineraryId}/regenerate`, body ?? {}).then(r => r.data),
};

// ── Activity endpoints ──────────────────────────────────────────────────────

export const activityApi = {
  create: (itineraryId: string, body: ActivityRequest): Promise<ActivityResponse> =>
    apiClient.post(`/itineraries/${itineraryId}/activities`, body).then(r => r.data),

  update: (itineraryId: string, activityId: string, body: ActivityUpdateRequest): Promise<ActivityResponse> =>
    apiClient.put(`/itineraries/${itineraryId}/activities/${activityId}`, body).then(r => r.data),

  delete: (itineraryId: string, activityId: string): Promise<void> =>
    apiClient.delete(`/itineraries/${itineraryId}/activities/${activityId}`).then(r => r.data),
};

// ── AI assist endpoints ─────────────────────────────────────────────────────

export interface ParseTripResult {
  destination: string | null;
  origin: string | null;
  startDate: string | null;
  endDate: string | null;
  travelers: number | null;
  budgetTier: 'budget' | 'standard' | 'luxury' | null;
  travelStyles: string[];
  rawSummary: string | null;
  destinationIsSuggested?: boolean;
}

export const aiApi = {
  parseTrip: (description: string): Promise<ParseTripResult> =>
    apiClient.post('/ai/parse-trip', { description }).then(r => r.data),
};

// ── Explore endpoints ────────────────────────────────────────────────────────

export interface ExplorePageResponse {
  content: ExploreItem[];
  totalPages: number;
  totalElements: number;
}

export const exploreApi = {
  getAll: (params: {
    destination?: string;
    minBudget?: number;
    maxBudget?: number;
    durationDays?: number;
    tags?: string[];
    page?: number;
    size?: number;
  }): Promise<ExplorePageResponse> =>
    apiClient.get('/explore', { params }).then(r => r.data),

  getById: (id: string): Promise<ExploreItem> =>
    apiClient.get(`/explore/${id}`).then(r => r.data),

  getTrending: (): Promise<ExploreItem[]> =>
    apiClient.get('/explore/trending').then(r => r.data),

  getRecommendations: (): Promise<ExploreItem[]> =>
    apiClient.get('/explore/recommendation').then(r => r.data),
};

export const experienceApi = {
  like: (id: string): Promise<void> =>
    apiClient.post(`/experiences/${id}/like`).then(r => r.data),
};

// ── Community endpoints ────────────────────────────────────────────────────────

export const communityApi = {
  shareContentFormData: (formData: FormData): Promise<SharedContentResponse> => {
    return apiClient.post('/community/share', formData).then(r => r.data);
  },

  shareContent: (request: ShareContentRequest, images?: File[]): Promise<SharedContentResponse> => {
    const formData = new FormData();
    formData.append('type', request.type);
    if (request.refId) formData.append('refId', request.refId);
    formData.append('content', request.content);
    if (request.rating) formData.append('rating', request.rating.toString());
    if (request.description) formData.append('description', request.description);
    
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }
    return apiClient.post('/community/share', formData).then(r => r.data);
  },

  rate: (id: string, stars: number): Promise<SharedContentResponse> =>
    apiClient.post(`/community/${id}/rate`, { stars }).then(r => r.data),

  addComment: (id: string, content: string): Promise<CommentResponse> =>
    apiClient.post(`/community/${id}/comments`, { content }).then(r => r.data),

  getComments: (id: string): Promise<CommentResponse[]> =>
    apiClient.get(`/community/${id}/comments`).then(r => r.data),

  getTrending: (type: 'ACTIVITY' | 'TRIP' | 'EXPLORE_ITEM', limit: number = 6): Promise<SharedContentResponse[]> =>
    apiClient.get('/community/trending', { params: { type, limit } }).then(r => r.data),

  uploadImage: (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/community/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },

  getExploreItemReviews: (id: string): Promise<SharedContentResponse[]> =>
    apiClient.get(`/community/explore/${id}/reviews`).then(r => r.data),

  getTopContributors: (limit: number = 5): Promise<any[]> =>
    apiClient.get(`/community/contributors`, { params: { limit } }).then(r => r.data),
};

export const adminApi = {
  getUsers: (): Promise<AdminUserResponse[]> =>
    apiClient.get('/admin/users').then(r => r.data),

  lockUser: (id: string): Promise<AdminUserResponse> =>
    apiClient.patch(`/admin/users/${id}/status`, JSON.stringify('LOCKED'), {
      headers: { 'Content-Type': 'application/json' }
    }).then(r => r.data),

  unlockUser: (id: string): Promise<AdminUserResponse> =>
    apiClient.patch(`/admin/users/${id}/status`, JSON.stringify('ACTIVE'), {
      headers: { 'Content-Type': 'application/json' }
    }).then(r => r.data),

  deleteUser: (id: string): Promise<void> =>
    apiClient.delete(`/admin/users/${id}`).then(r => r.data),

  getUserReviews: (id: string): Promise<SharedContentResponse[]> =>
    apiClient.get(`/admin/users/${id}/reviews`).then(r => r.data),

  getPendingContent: (): Promise<SharedContentResponse[]> =>
    apiClient.get('/admin/community/pending').then(r => r.data),

  approveContent: (id: string): Promise<SharedContentResponse> =>
    apiClient.post(`/admin/community/${id}/approve`).then(r => r.data),

  rejectContent: (id: string): Promise<void> =>
    apiClient.post(`/admin/community/${id}/reject`).then(r => r.data),

  getStats: (): Promise<{ pendingCount: number; approvedCount: number; rejectedCount: number }> =>
    apiClient.get('/admin/community/stats').then(r => r.data),

  getTopContributors: (limit: number = 5): Promise<any[]> =>
    apiClient.get(`/admin/community/contributors`, { params: { limit } }).then(r => r.data),

  // Places (Explore Items) Management
  getPlaces: (): Promise<ExploreItem[]> =>
    apiClient.get('/admin/places').then(r => r.data),

  createPlace: (body: Partial<ExploreItem>): Promise<ExploreItem> =>
    apiClient.post('/admin/places', body).then(r => r.data),

  updatePlace: (id: string, body: Partial<ExploreItem>): Promise<ExploreItem> =>
    apiClient.put(`/admin/places/${id}`, body).then(r => r.data),

  deletePlace: (id: string): Promise<void> =>
    apiClient.delete(`/admin/places/${id}`).then(r => r.data),

  uploadImage: (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/community/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },
};
