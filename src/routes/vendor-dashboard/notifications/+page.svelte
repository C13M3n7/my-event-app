<!-- Order Notifications -->
<script lang="ts">
    import NotificationCard from '$features/profile/components/NotificationCard.svelte';
    import type { Notification } from '$features/profile/types/notification.model';
  
    const vendorNotifications: Notification[] = [
      {
        id: 101,
        title: "New Order Received!",
        message: "Order #A1021 has been placed by a customer.",
        date: "Apr 24, 2025",
        icon: "🛒",
        unread: true
      },
      {
        id: 102,
        title: "Order Delivered",
        message: "Order #A1020 has been marked as delivered.",
        date: "Apr 23, 2025",
        icon: "✅",
        unread: false
      },
      {
        id: 103,
        title: "Vendor Profile Updated!",
        message: "Your profile details have been successfully updated.",
        date: "Apr 22, 2025",
        icon: "📝",
        unread: false
      },
      {
        id: 104,
        title: "Order Moved to Preparing",
        message: "Order #A1019 has been moved back to 'Preparing Orders'.",
        date: "Apr 21, 2025",
        icon: "↩️",
        unread: true
      }
    ];
  </script>
  
  <div style="padding: 3rem 5vw;">
    <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 2rem; color: #222;">
      Vendor Notifications
    </h1>
  
    {#each vendorNotifications as n}
      <NotificationCard {n} isVendor={true} />
    {/each}
  
    <div style="font-size: 1.2rem; margin-top: 4rem; color: #0077cc; text-align: center; cursor: pointer;">
      Missing updates? <br />
      <strong>Go to vendor notification history.</strong>
    </div>
  </div>
  