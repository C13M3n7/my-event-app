// src\routes\fnb-menu\[vendorId]\+page.ts
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getVendorMenu, getVendorInfo } from '$features/fnb/services/fnbService';

export const load: PageLoad = async ({ params }) => {
    try {
        const [menuItems, vendorInfo] = await Promise.all([
            getVendorMenu(params.vendorId),
            getVendorInfo(params.vendorId)
        ]);

        if (!vendorInfo) {
            throw error(404, 'Vendor not found');
        }

        return {
            menuItems: menuItems || [],
            vendorInfo,
            tableNumber: '1'
        };
    } catch (err) {
        if (err instanceof Error) {
            throw error(500, err.message);
        }
        throw error(500, 'Failed to load vendor data');
    }
};