<!-- event_listing -->
<script>
    let events = [
      {
        id: '1',
        title: 'Harvest Fusion Festival',
        date: '2025-05-23',
        location: 'Tropics City',
        image: 'images/event1.png',
      },
      {
        id: '2',
        title: 'Food Fiesta 2025',
        date: '2025-04-28',
        location: 'Riverfront Square',
        image: 'images/event2.png',
      },
      {
        id: '3',
        title: 'Art & Craft Weekend',
        date: '2025-05-05',
        location: 'City Hall Courtyard',
        image: 'images/event3.jpg',
      },
    ];
  </script>
  
  <main class="listing">
    <h1>Upcoming Events</h1>
    <div class="event-grid">
      {#each events as event}
        <a href="/events/{event.id}" class="event-card">  <!-- Simplified link syntax -->
          <img src={event.image} alt={event.title} />
          <div class="info">
            <h2>{event.title}</h2>
            <p>{event.date} · {event.location}</p>
          </div>
        </a>
      {/each}
    </div>
  </main>
  
  
  <style>
    .listing {
      padding: 2rem 1rem;
      max-width: 1200px;
      margin: auto;
    }
  
    h1 {
      text-align: center;
      color: #075985;
      margin-bottom: 2rem;
    }
  
    .event-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }
  
    .event-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s ease;
    }
  
    .event-card:hover {
      transform: scale(1.02);
    }
  
    img {
      width: 100%;
      height: 160px;
      object-fit: cover;
    }
  
    .info {
      padding: 1rem;
    }
  
    .info h2 {
      font-size: 1.2rem;
      color: #047857;
      margin-bottom: 0.5rem;
    }
  
    .info p {
      color: #4b5563;
      font-size: 0.95rem;
    }
  </style>