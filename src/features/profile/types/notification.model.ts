// src/lib/features/profile/types/notification.model.ts
export interface Notification {
    id: number;
    title: string;
    message: string;
    date: string;
    icon: string;
    unread: boolean;
  }