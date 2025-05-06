// features/fnb/services/paymentService.ts
import { goto } from '$app/navigation';
import { cart } from '../stores/cartStore'; // Updated import path
import type { CartItem } from '../types/cart';

type PaymentMethod = 'BillPlz' | 'Spay' | 'Cash';

interface PaymentResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

interface FnbTotals {
    subtotal: number;
    pointsDiscount: number;
    total: number;
    itemsCount: number;
}

export async function processFnbPayment(
    method: PaymentMethod,
    items: CartItem[],
    pointsUsed: number = 0
): Promise<PaymentResult> {
    try {
        // Validate payment method
        if (!['BillPlz', 'Spay', 'Cash'].includes(method)) {
            throw new Error('Invalid payment method for F&B');
        }

        // Calculate totals
        const { total } = calculateFnbTotals(items, pointsUsed);

        // Validate minimum amount
        if (total <= 0) {
            throw new Error('Payment amount must be greater than 0');
        }

        // Simulate API call with proper typing
        const paymentResponse = await simulatePaymentApiCall(method, total);

        if (!paymentResponse.success) {
            throw new Error(paymentResponse.error || 'Payment failed');
        }

        // Clear cart and redirect on success
        cart.clearCart();
        goto('/payment-confirmation');

        return {
            success: true,
            transactionId: paymentResponse.transactionId
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Payment processing failed'
        };
    }
}

export function calculateFnbTotals(items: CartItem[], points: number = 0): FnbTotals {
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const pointsDiscount = Math.min(points, subtotal);
    const total = Math.max(0, subtotal - pointsDiscount);

    return {
        subtotal,
        pointsDiscount,
        total,
        itemsCount: items.reduce((count, item) => count + item.quantity, 0)
    };
}

// Helper function for simulating payment API
async function simulatePaymentApiCall(
    method: PaymentMethod,
    amount: number
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate random failures for testing
    const shouldFail = Math.random() < 0.1; // 10% chance of failure
    if (shouldFail) {
        return {
            success: false,
            error: 'Payment processor unavailable'
        };
    }

    return {
        success: true,
        transactionId: `TXN-${Date.now()}-${method}`
    };
}