// shared/utils/imageUtils.ts
export function handleImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = '/fallback.png';
    target.onerror = null; // Prevent infinite loop if fallback also fails
  }