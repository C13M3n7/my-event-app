<script lang="ts">
  import NotificationCard from '$features/profile/components/NotificationCard.svelte';
  import type { Notification } from '$features/profile/types/notification.model';

  const notifications: Notification[] = [
    {
      id: 1,
      title: "Order completed!",
      message: "Order with ID#010321 has been delivered to your table.",
      date: "Mar 06, 2025",
      icon: "🍽️",
      unread: true
    },
    {
      id: 2,
      title: "Harvest Fusion Festival",
      message: "Join the urban Gawai destination now! Experience unity through arts, music, culinary and culture in the spirit of Gawai...",
      date: "Feb 28, 2025",
      icon: "🎉",
      unread: true
    },
    {
      id: 3,
      title: "Complete your profile today!",
      message: "Get personalized vouchers, deals & news just for you! Update your profile now.",
      date: "Feb 20, 2025",
      icon: "👤",
      unread: true
    },
    {
      id: 4,
      title: "Your table is ready!",
      message: "Please proceed to Table 8. Enjoy your meal!",
      date: "Feb 10, 2025",
      icon: "🍽️",
      unread: false
    }
  ];
</script>

<div style="width: 100%; min-height: 100vh; padding: 3rem 5vw; background-color: #f9f9f9; box-sizing: border-box;">
  <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 2rem; color: #222;">
    Notifications
  </h1>

  {#each notifications as n}
    <NotificationCard {n} />
  {/each}

  <div style="font-size: 1.2rem; margin-top: 4rem; color: #0077cc; cursor: pointer; text-align: center;">
    Missing notifications? <br />
    <strong>Go to historical notifications.</strong>
  </div>
</div>
