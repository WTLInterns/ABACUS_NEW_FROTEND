'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useUser } from '@/hooks/use-user';
import api from '@/services/api';
import { ledgerService, Ledger } from '@/services/ledger-service';

interface InventoryItem {
  id: number;
  itemName: string;
  quantity: number;
  pricePerItem: number;
}

interface LedgerData {
  quantity: string;
  paidPrice: string;
  name: string;
  perPeicePrice: number;
}

export default function LedgerPage(): React.JSX.Element {
  const { user } = useUser();
  const [inventoryItems, setInventoryItems] = React.useState<InventoryItem[]>([]);
  const [ledgers, setLedgers] = React.useState<Ledger[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [ledgersLoading, setLedgersLoading] = React.useState(true);
  const [outstandingAmount, setOutstandingAmount] = React.useState<string>('0');
  const [outstandingAmountLoading, setOutstandingAmountLoading] = React.useState(true);
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [purchaseForm, setPurchaseForm] = React.useState({
    quantity: '',
    paidPrice: ''
  });
  const [paymentScreenshot, setPaymentScreenshot] = React.useState<File | null>(null);
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch inventory items
        const inventoryResponse = await api.get<InventoryItem[]>('/inventory/getAllInventory');
        setInventoryItems(inventoryResponse.data);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
        showSnackbar('Failed to load inventory data', 'error');
      } finally {
        setLoading(false);
      }

      // Fetch ledger data if user is available
      if (user?.id) {
        const teacherId = Number.parseInt(user.id, 10);
        
        // Fetch ledger entries
        try {
          const ledgersResponse = await ledgerService.getLedgersByTeacherId(teacherId);
          setLedgers(ledgersResponse);
        } catch (error) {
          console.error('Error fetching ledger data:', error);
          showSnackbar('Failed to load purchase history', 'error');
        } finally {
          setLedgersLoading(false);
        }

        // Fetch outstanding amount
        try {
          setOutstandingAmountLoading(true);
          const outstandingResponse = await ledgerService.getOutstandingAmountByTeacherId(teacherId);
          setOutstandingAmount(outstandingResponse.outstandingAmount);
        } catch (error) {
          console.error('Error fetching outstanding amount:', error);
          showSnackbar('Failed to load outstanding amount', 'error');
        } finally {
          setOutstandingAmountLoading(false);
        }
      }
    };

    fetchData();
  }, [user?.id]);

  const handleOpenDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setPurchaseForm({
      quantity: '',
      paidPrice: ''
    });
    setPaymentScreenshot(null);
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setPurchaseForm({
      quantity: '',
      paidPrice: ''
    });
    setPaymentScreenshot(null);
    setFormErrors({});
  };

  const handleFormChange = (field: string, value: string) => {
    setPurchaseForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPaymentScreenshot(event.target.files[0]);
      
      // Clear error when user selects a file
      if (formErrors.paymentScreenshot) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors['paymentScreenshot'];
          return newErrors;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!purchaseForm.quantity) {
      errors.quantity = 'Quantity is required';
    } else {
      const quantity = Number.parseInt(purchaseForm.quantity, 10);
      if (Number.isNaN(quantity) || quantity <= 0) {
        errors.quantity = 'Quantity must be a positive number';
      } else if (selectedItem && quantity > selectedItem.quantity) {
        errors.quantity = `Quantity cannot exceed available stock (${selectedItem.quantity})`;
      }
    }
    
    if (!purchaseForm.paidPrice) {
      errors.paidPrice = 'Paid price is required';
    } else {
      const paidPrice = Number.parseFloat(purchaseForm.paidPrice);
      if (Number.isNaN(paidPrice) || paidPrice < 0) {
        errors.paidPrice = 'Paid price must be a valid number';
      } else if (selectedItem && purchaseForm.quantity) {
        const quantity = Number.parseInt(purchaseForm.quantity, 10);
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
      const teacherId = Number.parseInt(user.id, 10);
      
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
        setOutstandingAmountLoading(true);
        const outstandingResponse = await ledgerService.getOutstandingAmountByTeacherId(teacherId);
        setOutstandingAmount(outstandingResponse.outstandingAmount);
      } catch (error) {
        console.error('Error fetching outstanding amount:', error);
        showSnackbar('Failed to load outstanding amount', 'error');
      } finally {
        setOutstandingAmountLoading(false);
      }
    } catch (error: unknown) {
      console.error('Error purchasing item:', error);
      
      // Handle error response from backend
      const err = error as { response?: { data?: { message?: string } } };
      if (err.response?.data?.message) {
        showSnackbar(err.response.data.message, 'error');
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
                            <TableCell>Paid Price</TableCell>
                            <TableCell>Payment Screenshot</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {ledgers.map((ledger) => (
                            <TableRow key={ledger.id}>
                              <TableCell>{new Date(ledger.date).toLocaleDateString()}</TableCell>
                              <TableCell>{ledger.name}</TableCell>
                              <TableCell>{ledger.quantity}</TableCell>
                              <TableCell>{ledger.perPeicePrice}</TableCell>
                              <TableCell>{ledger.quantity * ledger.perPeicePrice}</TableCell>
                              <TableCell>{ledger.paidPrice}</TableCell>
                              <TableCell>
                                {ledger.paymentScreenshotUrl ? (
                                  <Button 
                                    variant="outlined" 
                                    size="small"
                                    onClick={() => window.open(ledger.paymentScreenshotUrl, '_blank')}
                                  >
                                    View
                                  </Button>
                                ) : (
                                  'No screenshot'
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography>No purchase history found.</Typography>
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
        <DialogTitle>Purchase Item</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedItem.itemName}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Available Quantity: {selectedItem.quantity}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 2 }}>
                Price Per Item: ₹{selectedItem.pricePerItem}
              </Typography>
              
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={purchaseForm.quantity}
                onChange={(e) => handleFormChange('quantity', e.target.value)}
                error={!!formErrors.quantity}
                helperText={formErrors.quantity}
                margin="normal"
                inputProps={{ min: 1, max: selectedItem.quantity }}
              />
              
              <TextField
                fullWidth
                label="Paid Price"
                type="number"
                value={purchaseForm.paidPrice}
                onChange={(e) => handleFormChange('paidPrice', e.target.value)}
                error={!!formErrors.paidPrice}
                helperText={formErrors.paidPrice}
                margin="normal"
                inputProps={{ min: 0, step: 0.01 }}
              />
              
              <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{ mt: 2 }}
                color={formErrors.paymentScreenshot ? 'error' : 'primary'}
              >
                Upload Payment Screenshot
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </Button>
              {formErrors.paymentScreenshot && (
                <Typography variant="caption" color="error">
                  {formErrors.paymentScreenshot}
                </Typography>
              )}
              {paymentScreenshot && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {paymentScreenshot.name}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handlePurchase} 
            variant="contained" 
            color="primary" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Purchase'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}