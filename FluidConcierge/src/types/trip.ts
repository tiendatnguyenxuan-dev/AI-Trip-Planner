// Trip status enum matching backend TripStatus
export type TripStatus = 'PLANNING' | 'GENERATING' | 'SELECTING_ACTIVITIES' | 'GENERATED' | 'CONFIRMED';

// Budget tier for UI slider (maps to budget value)
export type BudgetTier = 'budget' | 'standard' | 'luxury';

export const BUDGET_VALUES: Record<BudgetTier, number> = {
  budget: 2000000,
  standard: 5000000,
  luxury: 15000000,
};

export const BUDGET_LABELS: Record<BudgetTier, string> = {
  budget: 'Tiết kiệm',
  standard: 'Tiêu chuẩn',
  luxury: 'Cao cấp',
};

// Hardcoded test user ID (matching DataSeeder.java)
export const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';

// --- API Response Types (mirrors backend DTOs) ---

export interface TripResponse {
  id: string;
  userId: string;
  title: string;
  destination: string;
  startDate: string; // ISO date string "YYYY-MM-DD"
  endDate: string;
  budget: number;
  totalCost: number;
  status: TripStatus;
  createdAt: string; // ISO datetime string
  candidates?: ActivityCandidateResponse[];
  itineraries?: ItineraryResponse[];
}

export interface ActivityCandidateResponse {
  id: string;
  name: string;
  description: string;
  location: string;
  cost: number;
  selected: boolean;
}

export interface ActivityResponse {
  id: string;
  itineraryId: string;
  name: string;
  description: string;
  location: string;
  startTime: string; // "HH:mm:ss"
  endTime: string;
  cost: number;
  activityOrder: number;
}

export interface ItineraryResponse {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string; // ISO date string
  summary: string;
  activities: ActivityResponse[];
}

export interface GenerateResponse {
  tripId: string;
  status: TripStatus;
  aiLogId: number;
  itineraries?: ItineraryResponse[];
  candidates?: ActivityCandidateResponse[];
  generatedAt: string;
}

// --- API Request Types ---

export interface CreateTripRequest {
  userId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
}

export interface GenerateRequest {
  preferences?: string;
  promptVersion?: string;
  language?: string;
}

export interface RegenerateRequest {
  feedback?: string;
  promptVersion?: string;
  language?: string;
}

export interface ActivityRequest {
  name: string;
  description?: string;
  location?: string;
  startTime: string; // "HH:mm:ss"
  endTime: string;
  cost: number;
  activityOrder: number;
}

export interface ActivityUpdateRequest {
  name?: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  cost?: number;
  activityOrder?: number;
}

// --- Community Sharing Types ---

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface SharedContentResponse {
  id: string;
  user: UserResponse;
  type: 'ACTIVITY' | 'TRIP' | 'EXPLORE_ITEM' | 'STANDALONE_ACTIVITY';
  refId: string;
  content: string; // JSON string
  rating: number;
  totalRatingSum: number;
  totalVotes: number;
  hasUpvoted?: boolean;
  imageUrls?: string[];
  description?: string;
  cost?: number;
  duration?: number;
  status: string;
  createdAt: string;
  referenceData?: any; // ActivityResponse | TripResponse
}

export interface ShareContentRequest {
  type: 'ACTIVITY' | 'TRIP' | 'EXPLORE_ITEM' | 'STANDALONE_ACTIVITY';
  refId?: string;
  content: string; // JSON string with extra data
  rating: number;
  description?: string;
  cost?: number;
  duration?: number;
}

export interface CommentRequest {
  content: string;
}

export interface CommentResponse {
  id: string;
  sharedContentId: string;
  user: UserResponse;
  content: string;
  createdAt: string;
}

export interface RateRequest {
  stars: number;
}

export interface ExploreItem {
  id: string;
  title: string;
  destination: string;
  type: string;
  tags: string[];
  minBudget: number;
  maxBudget: number;
  durationDays: number;
  thumbnailUrl: string;
  popularityScore: number;
  description?: string;
  averageRating: number;
  reviewCount: number;
}
