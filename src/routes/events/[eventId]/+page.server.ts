import type { PageServerLoad } from './$types';
import { staticEvents } from '$features/events/data/staticEvents';

export const load: PageServerLoad = async ({ params }) => {
  const eventId = params.eventId;
  const event = staticEvents.find(e => e.id === eventId);

  if (!event) {
    throw new Error(`Event with ID ${eventId} not found`);
  }

  return {
    event
  };
};
