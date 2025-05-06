// src/features/events/types/festival.ts
export interface SocialMedia {
    instagram: string;
    facebook?: string;
}

export interface Organizer {
    name: string;
    role: string;
}

export interface FestivalData {
    videoUrl: string;
    socialMedia: SocialMedia;
    organizers: Organizer[];
    vendors: string[];
}

export type FestivalDay = 'retail' | 'festival';