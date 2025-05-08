<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';

  const sizeClasses = {
    sm: 'w-5 h-5',      // 20px
    md: 'w-10 h-10',    // 40px
    lg: 'w-15 h-15'     // 60px
  };

  const dotSizeClasses = {
    sm: 'w-3 h-3',      // 12px (60% of 20px)
    md: 'w-6 h-6',      // 24px (60% of 40px)
    lg: 'w-9 h-9'       // 36px (60% of 60px)
  };
</script>

<div class="relative {sizeClasses[size]}">
  <!-- Both dots positioned in the center -->
  <div class="absolute inset-0 m-auto {dotSizeClasses[size]} rounded-full bg-gray-800 animate-[bounce_2s_infinite_ease-in-out]"></div>
  <div class="absolute inset-0 m-auto {dotSizeClasses[size]} rounded-full bg-gray-800 animate-[bounce_2s_infinite_ease-in-out_reverse]"></div>
</div>

<style>
  @keyframes bounce {
    0%, 100% { transform: scale(0); }
    50% { transform: scale(1); }
  }
  @keyframes bounce_reverse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(0); }
  }
</style>