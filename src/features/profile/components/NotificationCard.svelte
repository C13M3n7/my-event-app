<!-- src\features\profile\components\NotificationCard.svelte -->
<script lang="ts">
    export let n: {
      id: number;
      title: string;
      message: string;
      date: string;
      icon: string;
      unread: boolean;
    };
    export let isVendor: boolean = false;
  </script>
  
  <div class="notification">
    <div class="icon">{n.icon}</div>
  
    <div class="content">
      <div class="title">{n.title}</div>
      <div class="message">{n.message}</div>
    </div>
  
    <div class="meta">
      <div class="date">{n.date}</div>
      {#if n.unread}
        <div class="unread-dot"></div>
      {/if}
    </div>
  </div>
  
  <style>
    .notification {
      display: flex;
      align-items: flex-start;
      background: white;
      padding: 1.75rem 2rem;
      margin-bottom: 1.5rem;
      border-radius: 1.25rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      position: relative;
    }
  
    .icon {
      font-size: 2.5rem;
      margin-right: 1.5rem;
      flex-shrink: 0;
    }
  
    .content {
      flex: 1;
    }
  
    .title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.4rem;
    }
  
    .message {
      font-size: 1.125rem;
      color: #444;
      margin-bottom: 0.4rem;
    }
  
    .meta {
      position: absolute;
      top: 1.8rem;
      right: 2rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  
    .date {
      font-size: 1rem;
      color: #999;
    }
  
    .unread-dot {
      width: 10px;
      height: 10px;
      background-color: red;
      border-radius: 50%;
    }
  
    @media (max-width: 768px) {
      .notification {
        flex-direction: column;
        padding: 1.2rem 1.4rem;
      }
  
      .icon {
        font-size: 2rem;
        margin-right: 0;
        margin-bottom: 0.5rem;
      }
  
      .title {
        font-size: 1.25rem;
      }
  
      .message {
        font-size: 1rem;
      }
  
      .meta {
        position: absolute;
        top: 0.8rem;
        right: 2rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
  
      .date {
        font-size: 0.875rem;
      }
    }
  </style>  