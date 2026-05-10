export interface NotificationPayload {
  type: string;
  message: string;
  experienceId: string;
  timestamp: number;
}

export interface LikeBroadcastPayload {
  newLikeCount: number;
}
