// src\routes\fnb-menu\+page.ts
import { getVendors } from '$features/fnb/services/fnbService';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const vendors = await getVendors();
  return { vendors };
};
