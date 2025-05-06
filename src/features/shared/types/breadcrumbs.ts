// src/features/shared/types/breadcrumbs.ts
export interface BreadcrumbItem {
    name: string;
    href: string;
    current?: boolean; // Optional flag for current page
  }