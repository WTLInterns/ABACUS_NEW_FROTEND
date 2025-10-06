import * as React from 'react';
import apiClient from '@/services/api';
import Swal from 'sweetalert2';

interface InventoryItem {
  id: number;
  itemName: string;
  quantity: number;
  pricePerItem: number;
}

interface UseInventoryReturn {
  inventoryItems: InventoryItem[];
  loading: boolean;
  fetchInventoryItems: () => Promise<void>;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateInventoryItem: (id: number, item: Omit<InventoryItem, 'id'>) => Promise<void>;
  deleteInventoryItem: (id: number) => Promise<void>;
}

export const useInventory = (): UseInventoryReturn => {
  const [inventoryItems, setInventoryItems] = React.useState<InventoryItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const getMasterAdminId = (): string | null => {
    const userData = localStorage.getItem('user-data');
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        return parsedUserData.id;
      } catch (parseError) {
        console.error('Error parsing user data from localStorage:', parseError);
      }
    }
    return null;
  };

  const fetchInventoryItems = React.useCallback(async () => {
    try {
      setLoading(true);
      const masterAdminId = getMasterAdminId();
      
      if (!masterAdminId) {
        console.error('Master Admin ID not found in localStorage');
        return;
      }
      
      const response = await apiClient.get<InventoryItem[]>(`/inventory/getAllInventories/${masterAdminId}`);
      setInventoryItems(response.data);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch inventory items. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const addInventoryItem = React.useCallback(async (item: Omit<InventoryItem, 'id'>) => {
    try {
      const masterAdminId = getMasterAdminId();
      
      if (!masterAdminId) {
        throw new Error('Master Admin ID not found in localStorage');
      }
      
      const response = await apiClient.post<InventoryItem>(`/inventory/createInventory/${masterAdminId}`, item);
      setInventoryItems(prevItems => [...prevItems, response.data]);
      
      Swal.fire({
        title: 'Success!',
        text: 'Inventory item added successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Error adding inventory item:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add inventory item. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      throw error;
    }
  }, []);

  const updateInventoryItem = React.useCallback(async (id: number, item: Omit<InventoryItem, 'id'>) => {
    try {
      const response = await apiClient.put<InventoryItem>(`/inventory/updateInventory/${id}`, item);
      
      // Update the item in the local state
      setInventoryItems(prevItems => 
        prevItems.map(inventoryItem => 
          inventoryItem.id === id ? { ...response.data } : inventoryItem
        )
      );
      
      Swal.fire({
        title: 'Success!',
        text: 'Inventory item updated successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Error updating inventory item:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update inventory item. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      throw error;
    }
  }, []);

  const deleteInventoryItem = React.useCallback(async (id: number) => {
    try {
      await apiClient.delete(`/inventory/deleteInventory/${id}`);
      
      // Remove the item from the local state
      setInventoryItems(prevItems => prevItems.filter(item => item.id !== id));
      
      Swal.fire({
        title: 'Success!',
        text: 'Inventory item deleted successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete inventory item. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      throw error;
    }
  }, []);

  return {
    inventoryItems,
    loading,
    fetchInventoryItems,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
  };
};