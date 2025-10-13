'use client';

import * as React from 'react';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { LoadingButton } from '@/components/core/loading-button';

import { config } from '@/config';
import api from '@/services/api';
import { ledgerService, LedgerData, Ledger } from '@/services/ledger-service';
import { UserContext } from '@/contexts/user-context';

interface InventoryItem {
  id: number;
  itemName: string;
  quantity: number;
  pricePerItem: number;
}

interface PurchaseForm {
  quantity: string;
  paidPrice: string;
}

export default function LedgerReportPage(): React.JSX.Element {
  const userContext = React.useContext(UserContext);
  const user = userContext?.user || null;
  const [inventoryItems, setInventoryItems] = React.useState<InventoryItem[]>([]);
  const [ledgers, setLedgers] = React.useState<Ledger[]>([]);
  const [outstandingAmount, setOutstandingAmount] = React.useState<string>('0');
  const [loading, setLoading] = React.useState(true);
  const [ledgersLoading, setLedgersLoading] = React.useState(true);
  const [outstandingAmountLoading, setOutstandingAmountLoading] = React.useState(true);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [purchaseForm, setPurchaseForm] = React.useState<PurchaseForm>({ quantity: '', paidPrice: '' });
  const [formErrors, setFormErrors] = React.useState<{ quantity?: string; paidPrice?: string; paymentScreenshot?: string }>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = React.useState<File | null>(null);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch inventory items
        const inventoryResponse = await api.get<InventoryItem[]>('/inventory/getAllInventory');
        setInventoryItems(inventoryResponse.data);
        
        // Fetch ledgers and outstanding amount for the current teacher
        if (user?.id) {
          const teacherId = parseInt(user.id);
          
          // Fetch ledgers
          try {
            const ledgersResponse = await ledgerService.getLedgersByTeacherId(teacherId);
            setLedgers(ledgersResponse);
          } catch (error) {
            console.error('Error fetching ledger data:', error);
            showSnackbar('Failed to load ledger data', 'error');
          } finally {
            setLedgersLoading(false);
          }
          
          // Fetch outstanding amount
          try {
            const outstandingResponse = await ledgerService.getOutstandingAmountByTeacherId(teacherId);
            setOutstandingAmount(outstandingResponse.outstandingAmount);
          } catch (error) {
            console.error('Error fetching outstanding amount:', error);
            showSnackbar('Failed to load outstanding amount', 'error');
          } finally {
            setOutstandingAmountLoading(false);
          }
        }
      } catch (error) {
        console.error('Error fetching inventory data:', error);
        showSnackbar('Failed to load inventory data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleOpenDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setPurchaseForm({ quantity: '', paidPrice: '' });
    setFormErrors({});
    setPaymentScreenshot(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setPaymentScreenshot(null);
  };

  const handleFormChange = (field: keyof PurchaseForm, value: string) => {
    setPurchaseForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user types
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete (newErrors as any)[field];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentScreenshot(e.target.files[0]);
      
      // Clear error when user selects a file
      if (formErrors.paymentScreenshot) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete (newErrors as any).paymentScreenshot;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const errors: { quantity?: string; paidPrice?: string; paymentScreenshot?: string } = {};
    
    if (!purchaseForm.quantity) {
      errors.quantity = 'Quantity is required';
    } else {
      const quantity = parseInt(purchaseForm.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        errors.quantity = 'Quantity must be a positive number';
      } else if (selectedItem && quantity > selectedItem.quantity) {
        errors.quantity = `Quantity cannot exceed available stock (${selectedItem.quantity})`;
      }
    }
    
    if (!purchaseForm.paidPrice) {
      errors.paidPrice = 'Paid price is required';
    } else {
      const paidPrice = parseFloat(purchaseForm.paidPrice);
      if (isNaN(paidPrice) || paidPrice < 0) {
        errors.paidPrice = 'Paid price must be a valid number';
      } else if (selectedItem && purchaseForm.quantity) {
        const quantity = parseInt(purchaseForm.quantity);
        const totalPrice = quantity * (selectedItem.pricePerItem || 0);
        if (paidPrice > totalPrice) {
          errors.paidPrice = `Paid price cannot exceed total price (${totalPrice})`;
        }
      }
    }
    
    // Payment screenshot is mandatory
    if (!paymentScreenshot) {
      errors.paymentScreenshot = 'Payment screenshot is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePurchase = async () => {
    if (!selectedItem || !validateForm() || !paymentScreenshot || !user?.id) {
      return;
    }

    setIsSubmitting(true);
    try {
      const teacherId = parseInt(user.id);
      
      // Create ledger data with inventory item name and price per item
      const ledgerData: LedgerData = {
        quantity: purchaseForm.quantity,
        paidPrice: purchaseForm.paidPrice,
        name: selectedItem.itemName,
        perPeicePrice: selectedItem.pricePerItem
      };
      
      // Create ledger entry (this will automatically handle inventory reduction)
      await ledgerService.createLedger(teacherId, selectedItem.id, ledgerData, paymentScreenshot);
      
      showSnackbar(`Successfully purchased ${selectedItem.itemName}`, 'success');
      handleCloseDialog();
      
      // Refresh inventory data
      const inventoryResponse = await api.get<InventoryItem[]>('/inventory/getAllInventory');
      setInventoryItems(inventoryResponse.data);
      
      // Refresh ledger data
      try {
        const ledgersResponse = await ledgerService.getLedgersByTeacherId(teacherId);
        setLedgers(ledgersResponse);
      } catch (error) {
        console.error('Error refreshing ledger data:', error);
      }
      
      // Refresh outstanding amount
      try {
        const outstandingResponse = await ledgerService.getOutstandingAmountByTeacherId(teacherId);
        setOutstandingAmount(outstandingResponse.outstandingAmount);
      } catch (error) {
        console.error('Error refreshing outstanding amount:', error);
      }
    } catch (error: any) {
      console.error('Error purchasing item:', error);
      
      // Handle error response from backend
      if (error.response?.data?.message) {
        showSnackbar(error.response.data.message, 'error');
      } else {
        showSnackbar(`Failed to purchase ${selectedItem?.itemName || 'item'}`, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>Loading inventory data...</Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Inventory Items Section */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  Inventory Items
                </Typography>
                <Typography variant="body1" paragraph>
                  Available items for purchase
                </Typography>
                
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Price Per Item</TableCell>
                      <TableCell>Total Value</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventoryItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.pricePerItem}</TableCell>
                        <TableCell>{item.quantity * item.pricePerItem}</TableCell>
                        <TableCell>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => handleOpenDialog(item)}
                            disabled={item.quantity <= 0}
                          >
                            Buy Now
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {inventoryItems.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography>No inventory items found.</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Ledger Report Section */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h4" gutterBottom>
                    My Purchase History
                  </Typography>
                  {outstandingAmountLoading ? (
                    <Typography variant="body1" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                      Loading outstanding amount...
                    </Typography>
                  ) : (
                    <Typography variant="body1" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                      Outstanding Amount: ₹{outstandingAmount}
                    </Typography>
                  )}
                </Box>
                <Typography variant="body1" paragraph>
                  Your ledger records
                </Typography>

                {ledgersLoading ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography>Loading purchase history...</Typography>
                  </Box>
                ) : (
                  <>
                    {ledgers.length > 0 ? (
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Item Name</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Price Per Item</TableCell>
                            <TableCell>Total Price</TableCell>
                            <TableCell>Paid Amount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {ledgers.map((ledger) => (
                            <TableRow key={ledger.id}>
                              <TableCell>{new Date(ledger.date).toLocaleDateString()}</TableCell>
                              <TableCell>{ledger.name}</TableCell>
                              <TableCell>{ledger.quantity}</TableCell>
                              <TableCell>{ledger.perPeicePrice}</TableCell>
                              <TableCell>{ledger.totalPrice}</TableCell>
                              <TableCell>{ledger.paidPrice}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography>You haven't made any purchases yet.</Typography>
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* Purchase Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Purchase Item - {selectedItem?.itemName}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, pb: 2 }}>
            {selectedItem && (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Price per item: ₹{selectedItem.pricePerItem}
              </Typography>
            )}
            
            <TextField
              fullWidth
              label="Quantity"
              value={purchaseForm.quantity}
              onChange={(e) => handleFormChange('quantity', e.target.value)}
              error={!!formErrors.quantity}
              helperText={formErrors.quantity}
              sx={{ mb: 2 }}
              type="number"
              InputProps={{ inputProps: { min: 1, max: selectedItem?.quantity || 0 } }}
            />
            
            <TextField
              fullWidth
              label="Paid Price"
              value={purchaseForm.paidPrice}
              onChange={(e) => handleFormChange('paidPrice', e.target.value)}
              error={!!formErrors.paidPrice}
              helperText={formErrors.paidPrice}
              sx={{ mb: 2 }}
              type="number"
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
            
            <TextField
              fullWidth
              label="Payment Screenshot"
              error={!!formErrors.paymentScreenshot}
              helperText={formErrors.paymentScreenshot || "Payment screenshot is required"}
              sx={{ mb: 2 }}
              type="file"
              InputProps={{
                inputProps: { accept: "image/*" }
              }}
              onChange={handleFileChange}
            />
            
            {selectedItem && (
              <Typography variant="body2" color="textSecondary">
                Available Quantity: {selectedItem.quantity} | 
                Maximum total: {purchaseForm.quantity ? 
                  (parseInt(purchaseForm.quantity) * (selectedItem.pricePerItem || 0)) : 0}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <LoadingButton 
            onClick={handlePurchase} 
            loading={isSubmitting}
            variant="contained" 
            color="primary"
          >
            Purchase
          </LoadingButton>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}