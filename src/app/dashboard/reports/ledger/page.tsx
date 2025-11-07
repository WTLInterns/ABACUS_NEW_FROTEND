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

  const getTeacherName = (): string => {
    const n = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    return n && n.length > 0 ? n : 'Unknown';
  };

  const escapeCsv = (value: unknown): string => {
    const str = value == null ? '' : String(value);
    if (/[",\n]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const exportLedgersToCSV = () => {
    if (!ledgers || ledgers.length === 0) {
      showSnackbar('No purchase history to export', 'error');
      return;
    }
    const teacherName = getTeacherName();
    const headers = [
      'Teacher Name',
      'Outstanding Amount',
      'Date',
      'Item Name',
      'Quantity',
      'Price Per Item',
      'Total Price',
      'Paid Price',
      'Payment Screenshot URL'
    ];
    const rows = ledgers.map(l => [
      teacherName,
      outstandingAmount,
      new Date(l.date).toLocaleDateString(),
      l.name,
      l.quantity,
      l.perPeicePrice,
      l.quantity * l.perPeicePrice,
      l.paidPrice,
      l.paymentScreenshotUrl || ''
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(escapeCsv).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `purchase-history-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportLedgersToPDF = () => {
    if (!ledgers || ledgers.length === 0) {
      showSnackbar('No purchase history to export', 'error');
      return;
    }
    const win = window.open('', '_blank');
    if (!win) return;
    const logoUrl = `${window.location.origin}/assets/abacusLogo.png`;
    const teacherName = getTeacherName();
    // compute totals
    const sumTotal = ledgers.reduce((acc, l) => acc + Number(l.quantity || 0) * Number(l.perPeicePrice || 0), 0);
    const sumPaid = ledgers.reduce((acc, l) => acc + Number(l.paidPrice || 0), 0);
    const rowsHtml = ledgers.map((l) => {
      const qty = Number(l.quantity || 0);
      const unit = Number(l.perPeicePrice || 0);
      const paid = Number(l.paidPrice || 0);
      const total = qty * unit;
      const dateVal = l.date ? new Date(l.date).toLocaleDateString() : '';
      return `<tr>
        <td>${l.id}</td>
        <td>${dateVal}</td>
        <td>${escapeCsv(l.name)}</td>
        <td class="num">${qty}</td>
        <td class="num">₹${unit.toFixed(2)}</td>
        <td class="num">₹${total.toFixed(2)}</td>
        <td class="num">₹${paid.toFixed(2)}</td>
        <td>${l.paymentScreenshotUrl ? escapeCsv(l.paymentScreenshotUrl) : ''}</td>
      </tr>`;
    }).join('');
    const generatedAt = new Date().toLocaleString();
    const html = `<!doctype html>
      <html><head><meta charset="utf-8" />
      <title>Purchase History</title>
      <style>
        :root { --primary:#2563eb; --muted:#64748b; --bg:#ffffff; --row:#f8fafc; }
        * { box-sizing: border-box; }
        body { font-family: Inter, Arial, sans-serif; background: var(--bg); margin:0; }
        .header { background: linear-gradient(90deg, var(--primary), #1e40af); color:#fff; padding: 16px 24px; display:flex; align-items:center; gap:14px; }
        .logo { width: 36px; height: 36px; object-fit: contain; filter: drop-shadow(0 1px 2px rgba(0,0,0,.2)); }
        .headtext { display:flex; flex-direction:column; }
        .title { margin: 0; font-size: 20px; font-weight: 700; line-height:1.2; }
        .subtitle { margin: 2px 0 0; opacity: .95; font-size: 11px; }
        .container { padding: 24px 28px; }
        .chips { display:flex; gap:10px; flex-wrap:wrap; margin: 16px 0 14px; }
        .chip { background:#eef2ff; border:1px solid #c7d2fe; color:#1e40af; padding:6px 10px; border-radius:999px; font-size:12px; }
        .cards { display:flex; gap:16px; flex-wrap:wrap; margin: 8px 0 18px; }
        .card { flex:1 1 220px; border:1px solid #e2e8f0; border-radius:12px; padding:14px 16px; }
        .card h4 { margin:0 0 6px; color:var(--muted); font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.04em; }
        .card .val { font-size:18px; font-weight:700; }
        table { width:100%; border-collapse:separate; border-spacing:0; font-size:12px; }
        thead th { background:#f1f5f9; color:#0f172a; text-align:left; padding:10px 12px; border-top:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0; }
        tbody td { padding:10px 12px; border-bottom:1px solid #e2e8f0; }
        tbody tr:nth-child(even) { background: var(--row); }
        td.num { text-align:right; font-variant-numeric: tabular-nums; }
        .footer { margin-top: 16px; color: var(--muted); font-size: 11px; text-align: center; }
      </style>
      </head>
      <body>
        <div class="header">
          <img class="logo" src="${logoUrl}" alt="Logo" />
          <div class="headtext">
            <h1 class="title">Vertex Abacus</h1>
            <div class="subtitle">Generated on ${generatedAt}</div>
          </div>
        </div>
        <div class="container">
          <div class="chips">
            <span class="chip">Teacher: ${teacherName}</span>
            <span class="chip">Items: ${ledgers.length}</span>
          </div>
          <div class="cards">
            <div class="card"><h4>Total Amount</h4><div class="val">₹${sumTotal.toFixed(2)}</div></div>
            <div class="card"><h4>Total Paid</h4><div class="val">₹${sumPaid.toFixed(2)}</div></div>
            <div class="card"><h4>Outstanding</h4><div class="val">₹${Number(outstandingAmount || '0').toFixed(2)}</div></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Date</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price Per Item</th>
                <th>Total Price</th>
                <th>Paid Price</th>
                <th>Payment Screenshot URL</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div class="footer">This is a system generated report.</div>
        </div>
        <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 300); };</script>
      </body></html>`;
    win.document.write(html);
    win.document.close();
  };

  // Per-ledger receipt (centered big logo, bold coupon code)
  const handleDownloadReceiptPdf = (l: Ledger) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const logoUrl = `${window.location.origin}/assets/abacusLogo.png`;
    const qty = Number(l.quantity || 0);
    const unit = Number(l.perPeicePrice || 0);
    const paid = Number(l.paidPrice || 0);
    const total = qty * unit;
    const dateVal = l.date ? new Date(l.date).toLocaleString() : '';
    const teacherName = getTeacherName();
    const html = `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt - ${l.id}</title>
        <style>
          :root { --muted:#6b7280; --border:#e5e7eb; }
          * { box-sizing:border-box; }
          body { font-family: Inter, Arial, sans-serif; margin:0; padding:28px; color:#111827; }
          .brand { text-align:center; margin-bottom:14px; }
          .brand img { width: 110px; height: 110px; object-fit: contain; display:inline-block; }
          .title { text-align:center; font-size: 18px; font-weight: 800; letter-spacing:.04em; margin: 6px 0 2px; }
          .coupon { text-align:center; font-size: 16px; font-weight: 800; margin: 0 0 14px; }
          .card { border:1px solid var(--border); border-radius:12px; padding:16px; }
          .row { display:flex; flex-wrap:wrap; gap:12px; margin-bottom:8px; }
          .cell { flex:1 1 180px; }
          .label { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.04em; margin-bottom:4px; }
          .value { font-size:14px; font-weight:600; }
          table { width:100%; border-collapse:separate; border-spacing:0; margin-top:12px; }
          th, td { border:1px solid var(--border); padding:10px 12px; font-size:12px; }
          th { text-align:left; background:#f9fafb; }
          td.num { text-align:right; font-variant-numeric: tabular-nums; }
          .totals { margin-top:10px; display:flex; justify-content:flex-end; }
          .totals table { width:auto; }
          .totals td { padding:6px 10px; }
          .totals .label { color:var(--muted); }
          .totals .value { font-weight:700; }
          .footer { margin-top: 14px; text-align:center; color:var(--muted); font-size:11px; }
        </style>
      </head>
      <body>
        <div class="brand">
          <img src="${logoUrl}" alt="Logo" />
        </div>
        <div class="title">Purchase Receipt</div>
        <div class="coupon">Coupon Code: <strong>${l.id}</strong></div>
        <div class="card">
          <div class="row">
            <div class="cell"><div class="label">Teacher</div><div class="value">${teacherName}</div></div>
            <div class="cell"><div class="label">Date</div><div class="value">${dateVal}</div></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price/Unit (₹)</th>
                <th>Paid (₹)</th>
                <th>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${escapeCsv(l.name)}</td>
                <td class="num">${qty}</td>
                <td class="num">₹${unit.toFixed(2)}</td>
                <td class="num">₹${paid.toFixed(2)}</td>
                <td class="num">₹${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="totals">
            <table>
              <tbody>
                <tr><td class="label">Total</td><td class="value">₹${total.toFixed(2)}</td></tr>
                <tr><td class="label">Paid</td><td class="value">₹${paid.toFixed(2)}</td></tr>
                <tr><td class="label">Balance</td><td class="value">₹${(total - paid).toFixed(2)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="footer">Thank you for your purchase.</div>
        <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 300); };</script>
      </body>
      </html>`;
    win.document.write(html);
    win.document.close();
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
    
    if (purchaseForm.quantity) {
      const quantity = Number.parseInt(purchaseForm.quantity, 10);
      if (Number.isNaN(quantity) || quantity <= 0) {
        errors.quantity = 'Quantity must be a positive number';
      } else if (selectedItem && quantity > selectedItem.quantity) {
        errors.quantity = `Quantity cannot exceed available stock (${selectedItem.quantity})`;
      }
    } else {
      errors.quantity = 'Quantity is required';
    }
    
    if (purchaseForm.paidPrice) {
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
    } else {
      errors.paidPrice = 'Paid price is required';
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
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
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
                  <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
                    My Purchase History
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button variant="outlined" size="small" onClick={exportLedgersToCSV} disabled={ledgersLoading || ledgers.length === 0}>
                      Download Excel (CSV)
                    </Button>
                    <Button variant="outlined" size="small" onClick={exportLedgersToPDF} disabled={ledgersLoading || ledgers.length === 0}>
                      Download PDF
                    </Button>
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
                            <TableCell>Coupon Code</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Item Name</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Price Per Item</TableCell>
                            <TableCell>Total Price</TableCell>
                            <TableCell>Paid Price</TableCell>
                            <TableCell>Payment Screenshot</TableCell>
                            <TableCell>Receipt</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {ledgers.map((ledger) => (
                            <TableRow key={ledger.id}>
                              <TableCell>{ledger.id}</TableCell>
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
                              <TableCell>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleDownloadReceiptPdf(ledger)}
                                >
                                  Receipt PDF
                                </Button>
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