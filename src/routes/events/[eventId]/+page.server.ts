// src/routes/events/[eventId]/+page.server.ts
import type { PageServerLoad } from './$types';
import { getEventById } from '$features/events/services/eventService';
import { getVendorsForEvent } from '$features/adminDashboard/services/crudVendor';
import { error } from '@sveltejs/kit';
import type { Event } from '$features/events/types';

export const load: PageServerLoad = async ({ params }) => {
  const eventData = await getEventById(params.eventId);
  
  if (!eventData || !eventData.id) {
    throw error(404, 'Event not found');
  }

  // Get vendors for this event
  const vendors = await getVendorsForEvent(params.eventId);

  // Transform admin data to match the Event type
  const event: Event = {
    id: eventData.id, // Now guaranteed to exist
    title: eventData.title || 'Untitled Event',
    description: eventData.tagline || '',
    image: eventData.imagePreview || '',
    price: eventData.pricingTiers?.length > 0 ? eventData.pricingTiers[0].price : '0',
    is_free: eventData.eventType === 'free',
    organiser: eventData.locationName || 'Unknown Organizer',
    location: eventData.locationName || 'Unknown Location',
    start_date: eventData.startDate || new Date().toISOString(),
    end_date: eventData.endDate || new Date().toISOString(),
    start_time: eventData.startTime || '',
    end_time: eventData.endTime || '',
    event_types: [eventData.type || 'general'],
    features: {
      music: '',
      food: '',
      retail: '',
      engagement: ''
    },
    agenda: [],
    speakers: [],
    socialMedia: {
      instagram: eventData.socialMediaUrl?.includes('instagram.com') ? 
        eventData.socialMediaUrl.split('instagram.com/')[1] : '',
      facebook: eventData.socialMediaUrl?.includes('facebook.com') ? 
        eventData.socialMediaUrl.split('facebook.com/')[1] : ''
    },
    venueMapUrl: eventData.imagePreview || null,
    layoutUrl: eventData.layoutImagePreview || null,
    videoUrl: eventData.videoUrl || '',
    organizers: [],
    vendors: vendors.map(v => v.business_name),
    registration_url: '',
    eventBriefUrl: eventData.eventBriefUrl
  };

  return { event };
};