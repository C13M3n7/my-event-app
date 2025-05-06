interface Event {
    id: string;
    title: string;
    description: string;
    image_url: string;
    is_free: boolean;
    organiser: string;
    location: {
      name: string;
      address: string;
    };
    start_date: string;
    end_date: string;
    event_types: string[];
    features: {
      music: string;
      food: string;
      retail: string;
      engagement: string;
    };
    agenda: Array<{
      date: string;
      day_title: string;
      slots: Array<{
        time: string;
        title: string;
        description: string;
        speaker_names: string[];
        location: string;
        is_paid: boolean;
        price: number;
        currency: string;
      }>;
    }>;
    speakers: Array<{
      name: string;
      title: string;
      bio: string;
      photo_url: string;
      has_paid_sessions: boolean;
      base_price: number;
    }>;
    socialMedia: {
      instagram: string;
      facebook: string;
    };
    venueMapUrl: string | null;
    layoutUrl: string | null;
    videoUrl: string;
    organizers: Array<{
      name: string;
      role: string;
    }>;
    vendors: string[];
    registration_url: string;
    max_capacity?: number;
  }