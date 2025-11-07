'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PencilIcon, TrashIcon } from '@phosphor-icons/react/dist/ssr';
import { useInventory } from '@/hooks';
import Swal from 'sweetalert2';
import { LoadingButton } from '@/components/core/loading-button';
import api from '@/services/api';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';

const schema = zod.object({
  itemName: zod.string().min(1, { message: 'Item name is required' }),
  quantity: zod.number().min(1, { message: 'Quantity must be at least 1' }),
  pricePerItem: zod.number().min(0, { message: 'Price must be a positive number' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  itemName: '',
  quantity: 1,
  pricePerItem: 0,
};

interface InventoryItem {
  id: number;
  itemName: string;
  quantity: number;
  pricePerItem: number;
}

interface TeacherResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export function InventoryForm(): React.JSX.Element {
  const [showForm, setShowForm] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<InventoryItem | null>(null);
  const { inventoryItems, loading, fetchInventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useInventory();
  const [teachers, setTeachers] = React.useState<TeacherResponseDto[]>([]);
  const [teachersLoading, setTeachersLoading] = React.useState<boolean>(true);
  const [selectedTeacher, setSelectedTeacher] = React.useState<TeacherResponseDto | null>(null);
  const [inventoryDialogOpen, setInventoryDialogOpen] = React.useState<boolean>(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = React.useState<boolean>(false);
  const [selectedInventory, setSelectedInventory] = React.useState<InventoryItem | null>(null);
  const [purchaseForm2, setPurchaseForm2] = React.useState<{ quantity: string; paidPrice: string }>({ quantity: '', paidPrice: '' });
  const [purchaseErrors, setPurchaseErrors] = React.useState<Record<string, string>>({});
  const [creatingLedger, setCreatingLedger] = React.useState<boolean>(false);
  const [ledgerTeacher, setLedgerTeacher] = React.useState<TeacherResponseDto | null>(null);
  const [teacherLedgers, setTeacherLedgers] = React.useState<Array<{ id: number; name: string; quantity: number; perPeicePrice: number; paidPrice: number; createdAt?: string }>>([]);
  const [ledgerLoading, setLedgerLoading] = React.useState<boolean>(false);
  const [outstandingAmount, setOutstandingAmount] = React.useState<number | null>(null);
  const [outstandingByTeacher, setOutstandingByTeacher] = React.useState<Record<number, number>>({});
  const [outstandingAllLoading, setOutstandingAllLoading] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  // Fetch all inventory items when component mounts
  React.useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  // Fetch teachers list
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setTeachersLoading(true);
        const res = await api.get<TeacherResponseDto[]>('/teachers');
        if (mounted) setTeachers(res.data);
        // Prefetch outstanding for each teacher
        if (mounted && Array.isArray(res.data) && res.data.length > 0) {
          setOutstandingAllLoading(true);
          try {
            const results = await Promise.allSettled(
              res.data.map(async (t) => {
                const r = await api.get<string>(`/ledger/outstanding-price/${t.id}`);
                const val = Number(r?.data ?? 0);
                return { id: t.id, amount: Number.isFinite(val) ? val : 0 };
              })
            );
            if (!mounted) return;
            const map: Record<number, number> = {};
            results.forEach((r) => {
              if (r.status === 'fulfilled') {
                map[r.value.id] = r.value.amount;
              }
            });
            setOutstandingByTeacher(map);
          } finally {
            if (mounted) setOutstandingAllLoading(false);
          }
        }
      } catch (e) {
        console.error('Failed to load teachers', e);
      } finally {
        if (mounted) setTeachersLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSelectTeacher = (t: TeacherResponseDto) => {
    setSelectedTeacher(t);
    setInventoryDialogOpen(true);
  };

  // Download single ledger receipt as a styled PDF (printable)
  const handleDownloadReceiptPdf = (l: { id: number; name: string; quantity: number; perPeicePrice: number; paidPrice: number; createdAt?: string; date?: string }) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const logoUrl = `${window.location.origin}/assets/abacusLogo.png`;
    const qty = Number(l.quantity || 0);
    const unit = Number(l.perPeicePrice || 0);
    const paid = Number(l.paidPrice || 0);
    const total = qty * unit;
    const dateVal = (l as any).date ? new Date((l as any).date).toLocaleString() : (l as any).createdAt ? new Date((l as any).createdAt).toLocaleString() : '';
    const teacherName = ledgerTeacher ? `${ledgerTeacher.firstName} ${ledgerTeacher.lastName}` : '';
    const html = `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt - ${l.id}</title>
        <style>
          :root { --primary:#111827; --muted:#6b7280; --border:#e5e7eb; }
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
                <td>${l.name}</td>
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

  const handleSelectTeacherForLedger = async (_: any, t: TeacherResponseDto | null) => {
    setLedgerTeacher(t);
    setTeacherLedgers([]);
    setOutstandingAmount(null);
    if (!t) return;
    try {
      setLedgerLoading(true);
      const res = await api.get<Array<{ id: number; name: string; quantity: number; perPeicePrice: number; paidPrice: number; createdAt?: string }>>(`/ledger/teacher/${t.id}`);
      setTeacherLedgers(res.data || []);
      // Fetch outstanding amount for this teacher
      const outRes = await api.get<string>(`/ledger/outstanding-price/${t.id}`);
      const parsed = Number(outRes?.data ?? 0);
      setOutstandingAmount(Number.isFinite(parsed) ? parsed : 0);
    } catch (e) {
      console.error('Failed to load teacher ledgers', e);
      setTeacherLedgers([]);
      setOutstandingAmount(null);
    } finally {
      setLedgerLoading(false);
    }
  };

  const handleOpenPurchase = (item: InventoryItem) => {
    setSelectedInventory(item);
    setPurchaseForm2({ quantity: '', paidPrice: '' });
    setPurchaseErrors({});
    setPurchaseDialogOpen(true);
  };

  // Export selected teacher ledger as CSV
  const handleExportTeacherLedgerCsv = () => {
    if (!ledgerTeacher) return;
    const headers = ['Coupon Code','Item Name','Quantity','Price/Unit (₹)','Paid (₹)','Total (₹)','Date'];
    const rows = teacherLedgers.map((l) => {
      const qty = Number(l.quantity || 0);
      const unit = Number(l.perPeicePrice || 0);
      const paid = Number(l.paidPrice || 0);
      const total = qty * unit;
      const date = (l as any).date ? new Date((l as any).date).toLocaleDateString() : (l as any).createdAt ? new Date((l as any).createdAt).toLocaleDateString() : '';
      return [
        l.id,
        l.name,
        qty,
        unit.toFixed(2),
        paid.toFixed(2),
        total.toFixed(2),
        date
      ];
    });
    const csv = [headers, ...rows]
      .map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const name = `${ledgerTeacher.firstName}_${ledgerTeacher.lastName}`.trim().replace(/\s+/g, '_');
    a.download = `ledger_${name}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export selected teacher ledger as a printable PDF (via print dialog)
  const handleExportTeacherLedgerPdf = () => {
    if (!ledgerTeacher) return;
    const name = `${ledgerTeacher.firstName} ${ledgerTeacher.lastName}`.trim();
    const win = window.open('', '_blank');
    if (!win) return;
    const logoUrl = `${window.location.origin}/assets/abacusLogo.png`;
    // Build table rows and compute totals
    let sumTotal = 0;
    let sumPaid = 0;
    const rowsHtml = teacherLedgers.map((l) => {
      const qty = Number(l.quantity || 0);
      const unit = Number(l.perPeicePrice || 0);
      const paid = Number(l.paidPrice || 0);
      const total = qty * unit;
      sumTotal += total;
      sumPaid += paid;
      const dateVal = (l as any).date ? new Date((l as any).date).toLocaleDateString() : (l as any).createdAt ? new Date((l as any).createdAt).toLocaleDateString() : '';
      return `<tr>
        <td>${l.id}</td>
        <td>${l.name}</td>
        <td class="num">${qty}</td>
        <td class="num">₹${unit.toFixed(2)}</td>
        <td class="num">₹${paid.toFixed(2)}</td>
        <td class="num">₹${total.toFixed(2)}</td>
        <td>${dateVal}</td>
      </tr>`;
    }).join('');
    const outstanding = outstandingAmount !== null ? Number(outstandingAmount) : 0;
    const generatedAt = new Date().toLocaleString();
    const html = `<!doctype html>
      <html><head><meta charset="utf-8" />
      <title>Ledger - ${name}</title>
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
        .totals { margin-top: 10px; display:flex; justify-content:flex-end; }
        .totals table { width:auto; }
        .totals td { padding:6px 10px; }
        .totals .label { color:var(--muted); }
        .totals .value { font-weight:700; }
        .footer { margin-top: 16px; color: var(--muted); font-size: 11px; text-align: center; }
        @media print { .no-print { display:none; } }
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
            <span class="chip">Teacher: ${name}</span>
            <span class="chip">Items: ${teacherLedgers.length}</span>
          </div>
          <div class="cards">
            <div class="card"><h4>Total Amount</h4><div class="val">₹${sumTotal.toFixed(2)}</div></div>
            <div class="card"><h4>Total Paid</h4><div class="val">₹${sumPaid.toFixed(2)}</div></div>
            <div class="card"><h4>Outstanding</h4><div class="val">₹${outstanding.toFixed(2)}</div></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price/Unit (₹)</th>
                <th>Paid (₹)</th>
                <th>Total (₹)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div class="totals">
            <table>
              <tbody>
                <tr><td class="label">Total Amount</td><td class="value">₹${sumTotal.toFixed(2)}</td></tr>
                <tr><td class="label">Total Paid</td><td class="value">₹${sumPaid.toFixed(2)}</td></tr>
                <tr><td class="label">Outstanding</td><td class="value">₹${outstanding.toFixed(2)}</td></tr>
              </tbody>
            </table>
          </div>
          <div class="footer">This is a system generated report.</div>
        </div>
        <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 300); };</script>
      </body></html>`;
    win.document.write(html);
    win.document.close();
  };

  const validatePurchase = (): boolean => {
    const errs: Record<string, string> = {};
    const qty = Number.parseInt(purchaseForm2.quantity || '0', 10);
    const paid = Number.parseFloat(purchaseForm2.paidPrice || '0');
    if (!purchaseForm2.quantity) errs.quantity = 'Quantity is required';
    if (!purchaseForm2.paidPrice) errs.paidPrice = 'Paid price is required';
    if (!Number.isFinite(qty) || qty <= 0) errs.quantity = 'Quantity must be positive';
    if (!Number.isFinite(paid) || paid < 0) errs.paidPrice = 'Paid price must be valid';
    if (selectedInventory) {
      if (qty > selectedInventory.quantity) errs.quantity = `Cannot exceed stock (${selectedInventory.quantity})`;
      const total = (selectedInventory.pricePerItem || 0) * qty;
      if (paid > total) errs.paidPrice = `Paid cannot exceed total (${total})`;
    }
    setPurchaseErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateLedger = async () => {
    if (!selectedTeacher || !selectedInventory) return;
    if (!validatePurchase()) return;
    try {
      setCreatingLedger(true);
      await api.post(`/ledger/create/${selectedTeacher.id}/${selectedInventory.id}`, {
        quantity: purchaseForm2.quantity,
        paidPrice: purchaseForm2.paidPrice,
        name: selectedInventory.itemName,
        perPeicePrice: selectedInventory.pricePerItem
      });
      // Close dialogs and reset state BEFORE showing success alert
      setPurchaseDialogOpen(false);
      setInventoryDialogOpen(false);
      setSelectedInventory(null);
      setPurchaseForm2({ quantity: '', paidPrice: '' });
      setPurchaseErrors({});
      await Swal.fire('Success', 'Purchase created successfully', 'success');
      fetchInventoryItems();
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Failed to create purchase', 'error');
    } finally {
      setCreatingLedger(false);
    }
  };

  // Handle edit button click
  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setValue('itemName', item.itemName);
    setValue('quantity', item.quantity);
    setValue('pricePerItem', item.pricePerItem);
    setShowForm(true);
  };

  // Handle delete button click
  const handleDeleteClick = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this inventory item? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteInventoryItem(id);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const onSubmit = React.useCallback(
    async (data: Values): Promise<void> => {
      try {
        // Update existing item or add new item
        const operation = editingItem
          ? updateInventoryItem(editingItem.id, {
              itemName: data.itemName,
              quantity: data.quantity,
              pricePerItem: data.pricePerItem,
            })
          : addInventoryItem({
              itemName: data.itemName,
              quantity: data.quantity,
              pricePerItem: data.pricePerItem,
            });
        
        await operation;
        
        // Reset form and hide it
        reset(defaultValues);
        setEditingItem(null);
        setShowForm(false);
      } catch (error) {
        // Error is already handled in the hook
        console.error('Error in form submission:', error);
      }
    },
    [addInventoryItem, updateInventoryItem, reset, editingItem]
  );

  const handleToggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      reset(defaultValues);
      setEditingItem(null);
    }
  };

  return (
    <Card>
      <CardHeader title="Manage Inventory" />
      <Divider />
      <CardContent>
        {/* Teacher Search (Autocomplete) for Ledger View */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Search Teacher (Ledger)</Typography>
          <Autocomplete
            options={teachers}
            loading={teachersLoading}
            value={ledgerTeacher}
            onChange={handleSelectTeacherForLedger}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName}`.trim()}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search teacher by name..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {teachersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>

        {/* Selected Teacher Ledger List */}
        {ledgerTeacher && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Ledger for: <strong>{ledgerTeacher.firstName} {ledgerTeacher.lastName}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Outstanding Amount: <strong>₹{outstandingAmount !== null ? Number(outstandingAmount).toFixed(2) : '0.00'}</strong>
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Button size="small" variant="outlined" onClick={handleExportTeacherLedgerCsv}>Download CSV</Button>
              <Button size="small" variant="contained" onClick={handleExportTeacherLedgerPdf}>Download PDF</Button>
            </Stack>
            <Box sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Coupon Code</TableCell>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price/Unit (₹)</TableCell>
                    <TableCell>Paid (₹)</TableCell>
                    <TableCell>Total (₹)</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Receipt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ledgerLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : teacherLedgers.length > 0 ? (
                    teacherLedgers.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>{l.id}</TableCell>
                        <TableCell>{l.name}</TableCell>
                        <TableCell>{l.quantity}</TableCell>
                        <TableCell>₹{Number(l.perPeicePrice ?? 0).toFixed(2)}</TableCell>
                        <TableCell>₹{Number(l.paidPrice ?? 0).toFixed(2)}</TableCell>
                        <TableCell>₹{(Number(l.quantity || 0) * Number(l.perPeicePrice || 0)).toFixed(2)}</TableCell>
                        <TableCell>{(l as any).date ? new Date((l as any).date).toLocaleDateString() : (l as any).createdAt ? new Date((l as any).createdAt).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined" onClick={() => handleDownloadReceiptPdf(l)}>Receipt PDF</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body2">No ledger records found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Box>
        )}

        {/* Admin: Teacher Selection Section (at top) */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Teachers</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {selectedTeacher ? (
              <>Selected: <strong>{selectedTeacher.firstName} {selectedTeacher.lastName}</strong> ({selectedTeacher.email})</>
            ) : (
              'Select a teacher to purchase inventory on their behalf'
            )}
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Outstanding (₹)</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teachersLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2">Loading teachers...</Typography>
                    </TableCell>
                  </TableRow>
                ) : teachers.length > 0 ? (
                  teachers.map((t) => (
                    <TableRow key={t.id} hover selected={selectedTeacher?.id === t.id}>
                      <TableCell>{t.id}</TableCell>
                      <TableCell>{t.firstName} {t.lastName}</TableCell>
                      <TableCell>{t.email}</TableCell>
                      <TableCell>
                        {outstandingAllLoading && !(t.id in outstandingByTeacher) ? (
                          <CircularProgress size={16} />
                        ) : (
                          `₹${Number(outstandingByTeacher[t.id] ?? 0).toFixed(2)}`
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant={selectedTeacher?.id === t.id ? 'contained' : 'outlined'}
                          onClick={() => handleSelectTeacher(t)}
                        >
                          {selectedTeacher?.id === t.id ? 'Selected' : 'Select'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2">No teachers found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search inventory items..."
              sx={{ flex: 1 }}
            />
            <Button 
              variant="contained" 
              color={showForm ? 'success' : 'primary'}
              onClick={handleToggleForm}
            >
              {showForm ? '+ Cancel' : 'Add Inventory Item'}
            </Button>
          </Stack>
        </Box>
        {/* Inventory Selection Dialog: opens after selecting a teacher */}
        <Dialog open={inventoryDialogOpen} onClose={() => setInventoryDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Select Inventory Item</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price Per Item (₹)</TableCell>
                    <TableCell>Total Value</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : inventoryItems.length > 0 ? (
                    inventoryItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{item.pricePerItem?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>₹{(item.quantity * (item.pricePerItem || 0)).toFixed(2)}</TableCell>
                        <TableCell align="right">
                          <Button size="small" variant="contained" disabled={item.quantity <= 0} onClick={() => handleOpenPurchase(item)}>
                            Buy Now
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2">No inventory items found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInventoryDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Purchase Form Dialog */}
        <Dialog open={purchaseDialogOpen} onClose={() => setPurchaseDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Enter Purchase Details</DialogTitle>
          <DialogContent>
            {selectedInventory && (
              <Box sx={{ pt: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {selectedInventory.itemName} · Price: ₹{selectedInventory.pricePerItem}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      type="number"
                      value={purchaseForm2.quantity}
                      onChange={(e) => setPurchaseForm2((p) => ({ ...p, quantity: e.target.value }))}
                      error={!!purchaseErrors.quantity}
                      helperText={purchaseErrors.quantity}
                      inputProps={{ min: 1, max: selectedInventory.quantity }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Paid Price"
                      type="number"
                      value={purchaseForm2.paidPrice}
                      onChange={(e) => setPurchaseForm2((p) => ({ ...p, paidPrice: e.target.value }))}
                      error={!!purchaseErrors.paidPrice}
                      helperText={purchaseErrors.paidPrice}
                      inputProps={{ min: 0, step: 0.01 }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                      Total Price: ₹{(() => {
                        const qty = Number.parseInt(purchaseForm2.quantity || '0', 10) || 0;
                        const price = selectedInventory.pricePerItem || 0;
                        return (qty * price).toFixed(2);
                      })()}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPurchaseDialogOpen(false)} disabled={creatingLedger}>Cancel</Button>
            <Button onClick={handleCreateLedger} variant="contained" disabled={creatingLedger}>
              {creatingLedger ? <CircularProgress size={20} /> : 'Create Purchase'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card sx={{ mb: 3, bgcolor: 'neutral.50' }}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid size={{ md: 6, xs: 12 }}>
                    <Controller
                      control={control}
                      name="itemName"
                      render={({ field }) => (
                        <FormControl error={Boolean(errors.itemName)} fullWidth>
                          <InputLabel required>Item Name</InputLabel>
                          <OutlinedInput {...field} label="Item Name" />
                          {errors.itemName ? <FormHelperText>{errors.itemName.message}</FormHelperText> : null}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ md: 3, xs: 12 }}>
                    <Controller
                      control={control}
                      name="quantity"
                      render={({ field }) => (
                        <FormControl error={Boolean(errors.quantity)} fullWidth>
                          <InputLabel required>Quantity</InputLabel>
                          <OutlinedInput
                            {...field}
                            label="Quantity"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            type="number"
                          />
                          {errors.quantity ? <FormHelperText>{errors.quantity.message}</FormHelperText> : null}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ md: 3, xs: 12 }}>
                    <Controller
                      control={control}
                      name="pricePerItem"
                      render={({ field }) => (
                        <FormControl error={Boolean(errors.pricePerItem)} fullWidth>
                          <InputLabel required>Price Per Item (₹)</InputLabel>
                          <OutlinedInput
                            {...field}
                            label="Price Per Item (₹)"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            startAdornment="₹"
                            type="number"
                          />
                          {errors.pricePerItem ? <FormHelperText>{errors.pricePerItem.message}</FormHelperText> : null}
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <LoadingButton 
                    loading={isSubmitting} 
                    type="submit" 
                    variant="contained"
                    loadingText={editingItem ? 'Updating...' : 'Adding...'}
                  >
                    {editingItem ? 'Update Inventory Item' : 'Add Inventory Item'}
                  </LoadingButton>
                </Box>
              </CardContent>
            </Card>
          </form>
        )}
        
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price Per Item (₹)</TableCell>
                <TableCell>Total Value</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1">Loading inventory items...</Typography>
                  </TableCell>
                </TableRow>
              ) : inventoryItems.length > 0 ? (
                inventoryItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₹{item.pricePerItem?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>₹{(item.quantity * (item.pricePerItem || 0)).toFixed(2)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button 
                          size="small" 
                          startIcon={<PencilIcon />} 
                          onClick={() => handleEditClick(item)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          startIcon={<TrashIcon />} 
                          color="error"
                          onClick={() => handleDeleteClick(item.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1">No inventory items found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
}