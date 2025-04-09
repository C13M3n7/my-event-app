// src/routes/events/[id]/+page.server.ts
import type { PageServerLoad } from './$types';

interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    address: string;
    image: string;
    description: string;
    price: string;
    organizer: string;
}

const mockEvents: Record<string, Event> = {
    '1': {
        id: '1',
        title: 'Sunset Music Festival',
        date: '2025-04-21',
        time: '18:00 - 23:00',
        location: 'Central Park',
        address: '123 Park Avenue, New York, NY',
        image: '/images/event1.jpg', // Changed to reference static/images
        description: 'Experience an unforgettable evening of live music under the stars.',
        price: '$45 - $120',
        organizer: 'City Events Co.'
    },
    '2': {
        id: '2',
        title: 'Food Truck Festival',
        date: '2025-05-15',
        time: '12:00 - 20:00',
        location: 'Downtown Square',
        address: '456 Main Street, New York, NY',
        image: '/images/event2.jpg',
        description: 'Taste delicious food from around the world at our annual food truck gathering.',
        price: 'Free entry',
        organizer: 'Local Eats Association'
    },
    '3': {
        id: '3',
        title: 'Art Exhibition Opening',
        date: '2025-06-03',
        time: '19:00 - 22:00',
        location: 'Modern Art Gallery',
        address: '789 Art Boulevard, New York, NY',
        image: '/images/event3.jpg',
        description: 'Discover emerging artists at our exclusive exhibition opening night.',
        price: '$25',
        organizer: 'Art Collective NYC'
    }
};

export const load: PageServerLoad = async ({ params }) => {
    const eventId = params.id;
    const event = mockEvents[eventId] || {
        id: '0',
        title: 'Event Not Found',
        date: '',
        time: '',
        location: '',
        address: '',
        image: '',
        description: 'The requested event could not be found.',
        price: '',
        organizer: ''
    };

    return { event };
};