<script>
    const activities = [
      {
        type: 'User',
        caption: 'Added McDonalds to Harvest event',
        date: 'Yesterday'
      },
      {
        type: 'Admin',
        caption: 'Removed user JohnDoe from system',
        date: '2 days ago'
      },
      {
        type: 'System',
        caption: 'Updated analytics for Eras Tour',
        date: 'Today'
      }
    ];
  </script>
  
  <style>
    .page-wrapper {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  
    .overview-title {
      text-align: center;
      font-size: 2.2rem;
      margin-bottom: 2.5rem;
      font-weight: 600;
      color: #333;
    }
  
    .overview-container {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 2rem;
     
    }
  
    a.overview-box {
      width: 220px;
      height: 100px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      font-weight: bold;
      text-align: center;
      padding: 1rem;
      cursor: pointer;
      box-shadow: 0 4px 8px rgba(0,0,0,0.05);
      border: 2px solid #ddd;
      transition: all 0.2s ease-in-out;
      text-decoration: none;
    }
  
    a.overview-box:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 12px rgba(0,0,0,0.1);
    }
  
    .user-box {
      background-color: #eaf4ff;
      border-color: #1e90ff;
      color: #1e3a8a;
    }
  
    .events-box {
      background-color: #fff0e5;
      border-color: #ff8c00;
      color: #a64b00;
    }
  
    .analytics-box {
      background-color: #f0fff4;
      border-color: #28a745;
      color: #155724;
    }
  
    .recent-activities-wrapper {
      background-color: #f9f9f9;
      padding: 2rem 4rem;
      margin-top: 3rem;
      width: 100%;
    }
  
    .recent-activities-wrapper h2 {
      font-size: 1.6rem;
      margin-bottom: 1rem;
      color: #333;
    }
  
    .activity {
      background-color: white;
      padding: 1rem;
      margin-bottom: 0.75rem;
      border-left: 4px solid #007bff;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
  
    .activity strong {
      color: #007bff;
      display: block;
      margin-bottom: 0.3rem;
    }
  
    @media (max-width: 768px) {
      .overview-box {
        width: 100%;
        max-width: 300px;
      }
  
      .recent-activities-wrapper {
        padding: 1rem 1.5rem;
      }
    }
  </style>
  
  <div class="page-wrapper">
    <div class="overview-title">Overview</div>
  
    <div class="overview-container">
      <a href="/admin-dashboard/users" class="overview-box user-box">
        User Management
      </a>
      <a href="/admin-dashboard/events" class="overview-box events-box">
        Events
      </a>
      <a href="/admin-dashboard/analytics" class="overview-box analytics-box">
        Analytics
      </a>
    </div>
  </div>
  
  <!-- Full width Recent Activities -->
  <div class="recent-activities-wrapper">
    <h2>Recent Activities</h2>
    {#each activities as activity}
      <div class="activity">
        <strong>{activity.type}</strong>
        <div>{activity.caption}</div>
        <div style="font-size: 0.9rem; color: gray;">{activity.date}</div>
      </div>
    {/each}
  </div>
  