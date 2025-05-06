// shared/types/payment.ts
export type PaymentMethod = 'BillPlz' | 'Spay' | 'Cash';
export type PaymentContext = 'fnb' | 'tickets';

export const paymentMethods: Record<PaymentContext, PaymentMethod[]> = {
  fnb: ['BillPlz', 'Spay', 'Cash'],
  tickets: ['BillPlz', 'Spay']
};

export interface PaymentRequest {
  method: PaymentMethod;
  context: PaymentContext;
  amount: number;
  items: any[];
  userPoints?: number;
}