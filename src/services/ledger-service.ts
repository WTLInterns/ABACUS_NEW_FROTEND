import apiClient from './api';

export interface LedgerData {
  quantity: string;
  paidPrice: string;
  name: string;
  totalPrice?: string;
  date?: string;
  perPeicePrice?: number;
  paymentScreenshotUrl?: string;
  paymentScreenshotPublicId?: string;
}

// Add interface for Ledger response
export interface Ledger {
  id: number;
  teacherId: number;
  inventoryItemId: number;
  name: string;
  quantity: number;
  perPeicePrice: number;
  totalPrice: number;
  paidPrice: number;
  paymentScreenshotUrl: string;
  paymentScreenshotPublicId: string;
  date: string; // ISO date string
}

export const ledgerService = {
  createLedger: async (
    teacherId: number,
    inventoryId: number,
    ledgerData: LedgerData,
    paymentScreenshot: File
  ) => {
    try {
      const formData = new FormData();
      
      // Add all ledger fields individually
      Object.keys(ledgerData).forEach(key => {
        const value = (ledgerData as any)[key];
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      // Add payment screenshot
      formData.append('paymentScreenshot', paymentScreenshot);
      
      const response = await apiClient.post(
        `/ledger/create/${teacherId}/${inventoryId}`,
        formData
      );
      
      return response.data;
    } catch (error: any) {
      // Re-throw the error so it can be handled by the caller
      throw error;
    }
  },

  // Add new method to fetch ledgers by teacher ID
  getLedgersByTeacherId: async (teacherId: number) => {
    try {
      const response = await apiClient.get<Ledger[]>(`/ledger/teacher/${teacherId}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Fix the method to match the backend API which returns a simple string
  getOutstandingAmountByTeacherId: async (teacherId: number) => {
    try {
      const response = await apiClient.get<string>(`/ledger/outstanding-price/${teacherId}`);
      return { outstandingAmount: response.data };
    } catch (error: any) {
      throw error;
    }
  }
};