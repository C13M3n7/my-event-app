<!-- routes/events/[id]/+page.svelte -->
<script lang="ts">
    export let data;
    $: ({ event } = data);
    
    // Mock data
    const festivalData = {
      videoUrl: "https://youtu.be/festival2024",
      socialMedia: {
        instagram: "@harvestfusion",
        facebook: "HarvestFusionFest"
      },
      organizers: [
        { name: "Sarawak Cultural Board", role: "Main Organizer" },
        { name: "Kuching City Council", role: "Venue Partner" }
      ],
      vendors: ["Bakeh Cookhouse", "Tuak Collective", "Artisan Market", "Gawai Cookies Co"]
    };
    
    let activeTab = "about";
    let selectedDay = "festival";
  </script>
  
  <main class="event-details">
    <!-- Back button -->
    <div class="back-link">
      <a href="/events" class="back-button" aria-label="Back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/>
        </svg>
      </a>
    </div>
  
    <!-- Hero Section -->
    <section class="hero">
      <img src="/images/event1_bg.png" alt="Harvest Fusion Festival 2025" class="event-poster" />
      <div class="event-header">
        <h1>Harvest Fusion Festival 2025</h1>
        <p class="location">Tropics City, Kuching</p>
      </div>
    </section>
  
    <!-- Tab Navigation -->
    <nav class="tabs">
      <button class:active={activeTab === 'about'} on:click={() => activeTab = 'about'}>
        <svg width="24" height="24" fill="none"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" stroke-width="2"/><path d="M12 16v-4m0-4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <span>About</span>
      </button>
      <button class:active={activeTab === 'program'} on:click={() => activeTab = 'program'}>
        <svg width="24" height="24" fill="none"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="2"/></svg>
        <span>Program</span>
      </button>
      <button class:active={activeTab === 'map'} on:click={() => activeTab = 'map'}>
        <svg width="24" height="24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/><path d="M12 13a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" stroke-width="2"/></svg>
        <span>Venue</span>
      </button>
    </nav>
  
    <!-- Content Sections -->
    {#if activeTab === 'about'}
      <section class="content-section">
        <!-- Festival Dates -->
        <div class="info-card">
          <h2>Festival Dates</h2>
          <div class="date-toggle">
            <button class:active={selectedDay === 'retail'} on:click={() => selectedDay = 'retail'}>Retail & Bazaar</button>
            <button class:active={selectedDay === 'festival'} on:click={() => selectedDay = 'festival'}>Main Festival</button>
          </div>
          {#if selectedDay === 'retail'}
            <p class="date-range">23 May 2025 (Fri) - 27 May 2025 (Tue)</p>
          {:else}
            <p class="date-range">28 May 2025 (Wed) - 31 May 2025 (Sat)</p>
          {/if}
          <p class="footfall">1000-1500 visitors daily</p>
        </div>
  
        <!-- Festival Highlights -->
        <div class="info-card">
          <h2>Why Attend HFF2025?</h2>
          <ul class="highlight-list">
            <li>The only urban Gawai festival with premium experience</li>
            <li>Exclusive fusion food by reputable vendors</li>
            <li>Immersive cultural experience for families</li>
            <li>"Udah Makai Buai" environmental initiative</li>
          </ul>
        </div>
  
      <!-- Video Preview -->
      <div class="video-container">
        <h2>HFF2024 Highlights</h2>
        <div class="video-placeholder">
          <img src="/images/vid_preview.png" alt="HFF2024 Highlights" />
          <a href={festivalData.videoUrl} class="play-button" aria-label="Play HFF2024 highlights video">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </a>
        </div>
        <div class="social-links">
          <a href={`https://instagram.com/${festivalData.socialMedia.instagram}`} target="_blank">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            @harvestfusion
          </a>
        </div>
      </div>
      </section>
  
    {:else if activeTab === 'program'}
      <section class="content-section">
        <!-- Festival Features -->
        <div class="info-card">
          <h2>Festival Features</h2>
          <div class="feature-grid">
            <div class="feature-item">
              <svg width="32" height="32" fill="none"><path d="M9 18v-7m3 7v-4m3 4v-2m3 2v-4m3 4v-7M4 6h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="#10B981" stroke-width="2"/></svg>
              <h3>Music</h3>
              <p>Independent bands, DJs, At Adau single launch</p>
            </div>
            <div class="feature-item">
              <svg width="32" height="32" fill="none"><path d="M12 2v4m0 14v4M5 12H1m22 0h4m-4.64-6.36l-2.83 2.83m-9.9 9.9l-2.83 2.83M18.36 18.36l-2.83-2.83M5.64 5.64l2.83 2.83" stroke="#10B981" stroke-width="2"/></svg>
              <h3>F&B</h3>
              <p>Bakeh Cookhouse, artisan coffee, fusion cuisine</p>
            </div>
            <div class="feature-item">
              <svg width="32" height="32" fill="none"><path d="M3 10h18M7 15h1m4 0h1m4 0h1M3 19h18a2 2 0 002-2V7a2 2 0 00-2-2H3a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#10B981" stroke-width="2"/></svg>
              <h3>Retail</h3>
              <p>Artisan market, tuak market, Gawai cookies</p>
            </div>
            <div class="feature-item">
              <svg width="32" height="32" fill="none"><path d="M16 8v8l4 4m6-12a10 10 0 11-20 0 10 10 0 0120 0z" stroke="#10B981" stroke-width="2"/></svg>
              <h3>Engagement</h3>
              <p>Workshops, competitions, cultural ceremonies</p>
            </div>
          </div>
        </div>
  
        <!-- Daily Schedule -->
        <div class="info-card">
          <h2>Tentative Program</h2>
          <div class="schedule">
            <div class="day-selector">
              {#each ["Wed 28", "Thu 29", "Fri 30", "Sat 31"] as day}
                <button class:active={selectedDay === day} on:click={() => selectedDay = day}>
                  {day}
                </button>
              {/each}
            </div>
            <div class="time-slots">
              <!-- Sample time slot -->
              <div class="time-slot">
                <span class="time">10:00 AM</span>
                <div class="event">
                  <h4>Market Opens</h4>
                  <p>Artisan & food vendors</p>
                </div>
              </div>
              <div class="time-slot">
                <span class="time">2:00 PM</span>
                <div class="event">
                  <h4>Fusion Dance Workshop</h4>
                  <p>Main Stage</p>
                </div>
              </div>
              <!-- More time slots... -->
            </div>
          </div>
        </div>
      </section>
  
    {:else if activeTab === 'map'}
      <section class="content-section">
        <!-- Venue Map -->
        <div class="info-card">
          <h2>Venue: Tropics City</h2>
          <div class="map-container">
            <img src="/images/venue.png" alt="Tropics City Map" class="venue-map" />
            <div class="map-actions">
              <a href="https://maps.apple.com/?q=Tropics+City+Kuching" class="map-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#075985"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                Apple Maps
              </a>
              <a href="https://www.google.com/maps?q=Tropics+City+Kuching" class="map-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#075985"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                Google Maps
              </a>
              <a href="https://www.waze.com/ul?q=Tropics+City+Kuching" class="map-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#075985"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                Waze
              </a>
            </div>
          </div>
        </div>
  
        <!-- Festival Layout -->
        <div class="info-card">
          <h2>Festival Ground Layout</h2>
          <img src="/images/festive_ground_layout.png" alt="Festival Layout" class="layout-image" />
        </div>
  
        <!-- Partners -->
        <div class="info-card partners">
          <h2>Vendors & Organizers</h2>
          <div class="partner-grid">
            {#each festivalData.vendors as vendor}
              <div class="partner-logo">
                <div class="logo-placeholder"></div>
                <p>{vendor}</p>
              </div>
            {/each}
          </div>
          <div class="organizers">
            <h3>Organizing Committee</h3>
            {#each festivalData.organizers as org}
              <p><strong>{org.name}</strong> - {org.role}</p>
            {/each}
          </div>
        </div>
      </section>
    {/if}
  
    <!-- Fixed CTA -->
    <div class="fixed-cta">
      <a href="/payment?event=Harvest+Fusion+Festival+2025&type=festival&price=50" class="cta-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" stroke="white" stroke-width="2"/></svg>
        Get Tickets
      </a>
    </div>
  </main>
  
  <style>
    /* Base Styles */
    :global(body) {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
  
    .event-details {
      max-width: 600px;
      margin: 0 auto;
      padding-bottom: 80px;
    }
  
    /* Back Button */
    .back-link {
      position: sticky;
      top: 0;
      z-index: 10;
      padding: 12px 16px;
      background: rgba(255,255,255,0.8);
      backdrop-filter: blur(10px);
    }
  
    .back-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      color: #075985;
    }
  
    /* Hero Section */
    .hero {
      position: relative;
      margin-bottom: 16px;
    }
  
    .event-poster {
      width: 100%;
      height: 300px;
      object-fit: cover;
      display: block;
    }
  
    .event-header {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 24px 16px;
      background: linear-gradient(transparent, rgba(0,0,0,0.8));
      color: white;
    }
  
    .event-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      line-height: 1.2;
    }
  
    .location {
      margin: 4px 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
  
    /* Tab Navigation */
    .tabs {
      display: flex;
      border-bottom: 1px solid #e2e8f0;
      padding: 0 16px;
      margin-bottom: 16px;
    }
  
    .tabs button {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 0;
      background: none;
      border: none;
      color: #64748b;
      font-size: 12px;
      gap: 4px;
    }
  
    .tabs button.active {
      color: #075985;
      position: relative;
    }
  
    .tabs button.active:after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: #075985;
    }
  
    .tabs svg {
      width: 24px;
      height: 24px;
    }
  
    /* Content Sections */
    .content-section {
      padding: 0 16px;
      margin-bottom: 24px;
    }
  
    .info-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
  
    .info-card h2 {
      margin: 0 0 16px;
      font-size: 20px;
      color: #075985;
    }
  
    /* Date Toggle */
    .date-toggle {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
  
    .date-toggle button {
      flex: 1;
      padding: 8px;
      background: #f1f5f9;
      border: none;
      border-radius: 8px;
      font-size: 14px;
    }
  
    .date-toggle button.active {
      background: #075985;
      color: white;
    }
  
    .date-range {
      font-size: 18px;
      font-weight: 600;
      margin: 8px 0;
    }
  
    .footfall {
      font-size: 14px;
      color: #64748b;
    }
  
    /* Highlights List */
    .highlight-list {
      padding-left: 20px;
      margin: 0;
    }
  
    .highlight-list li {
      margin-bottom: 8px;
      font-size: 15px;
      line-height: 1.4;
    }
  
    /* Video Container */
    .video-container {
      margin-top: 24px;
    }
  
    .video-placeholder {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      margin-top: 12px;
    }
  
    .video-placeholder img {
      width: 100%;
      height: 180px;
      object-fit: cover;
    }
  
    .play-button {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.6);
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  
    /* Social Links */
    .social-links {
      margin-top: 12px;
    }
  
    .social-links a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #075985;
      text-decoration: none;
      font-weight: 500;
    }
  
    /* Features Grid */
    .feature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 16px;
    }
  
    .feature-item {
      text-align: center;
      padding: 12px;
      background: #f8fafc;
      border-radius: 12px;
    }
  
    .feature-item svg {
      margin-bottom: 8px;
    }
  
    .feature-item h3 {
      margin: 8px 0 4px;
      font-size: 16px;
      color: #075985;
    }
  
    .feature-item p {
      margin: 0;
      font-size: 13px;
      color: #64748b;
    }
  
    /* Schedule */
    .day-selector {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      overflow-x: auto;
      padding-bottom: 8px;
    }
  
    .day-selector button {
      padding: 8px 12px;
      background: #f1f5f9;
      border: none;
      border-radius: 20px;
      font-size: 14px;
      white-space: nowrap;
    }
  
    .day-selector button.active {
      background: #075985;
      color: white;
    }
  
    .time-slots {
      display: grid;
      gap: 12px;
    }
  
    .time-slot {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 12px;
    }
  
    .time {
      font-weight: 600;
      color: #075985;
      min-width: 60px;
    }
  
    .time-slot .event h4 {
      margin: 0 0 4px;
      font-size: 15px;
    }
  
    .time-slot .event p {
      margin: 0;
      font-size: 13px;
      color: #64748b;
    }
  
    /* Map Section */
    .map-container {
      margin-top: 16px;
    }
  
    .venue-map {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 12px;
    }
  
    .map-actions {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
    }
  
    .map-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 8px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 12px;
      color: #075985;
    }
  
    /* Layout Image */
    .layout-image {
      width: 100%;
      border-radius: 12px;
      margin-top: 12px;
    }
  
    /* Partners */
    .partner-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 16px 0;
    }
  
    .partner-logo {
      text-align: center;
    }
  
    .logo-placeholder {
      width: 100%;
      height: 60px;
      background: #f1f5f9;
      border-radius: 8px;
      margin-bottom: 8px;
    }
  
    .organizers {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }
  
    .organizers h3 {
      margin: 0 0 12px;
      font-size: 16px;
      color: #075985;
    }
  
    .organizers p {
      margin: 0 0 8px;
      font-size: 14px;
    }
  
    /* Fixed CTA */
    .fixed-cta {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px;
      background: linear-gradient(transparent, white);
      display: flex;
      justify-content: center;
    }
  
    .cta-button {
      background: #10B981;
      color: white;
      border: none;
      border-radius: 50px;
      padding: 16px 24px;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      width: 100%;
      max-width: 300px;
      justify-content: center;
    }
  
    /* Responsive Adjustments */
    @media (min-width: 768px) {
      .event-poster {
        height: 400px;
      }
      
      .feature-grid {
        grid-template-columns: 1fr 1fr 1fr 1fr;
      }
    }
  </style>