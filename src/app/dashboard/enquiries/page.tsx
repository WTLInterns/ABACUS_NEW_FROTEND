"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TablePagination from "@mui/material/TablePagination";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import api from "@/services/api";

interface Enquiry {
  id: number;
  name: string;
  contactNo: string;
  address: string;
  message: string;
}

export default function EnquiriesPage(): React.JSX.Element {
  const [loading, setLoading] = React.useState(true);
  const [enquiries, setEnquiries] = React.useState<Enquiry[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const fetchEnquiries = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Enquiry[]>("/enquiry");
      const list = Array.isArray(res.data) ? res.data : [];
      list.sort((a, b) => Number(b.id) - Number(a.id));
      setEnquiries(list);
    } catch (e) {
      console.error("Failed to load enquiries", e);
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    const ok = window.confirm("Delete this enquiry?");
    if (!ok) return;
    try {
      await api.delete(`/enquiry/${id}`);
      setEnquiries((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      console.error("Failed to delete enquiry", e);
      alert("Failed to delete enquiry");
    }
  };

  const paginated = React.useMemo(() => {
    const start = page * rowsPerPage;
    return enquiries.slice(start, start + rowsPerPage);
  }, [enquiries, page, rowsPerPage]);

  return (
    <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="xl">
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h4" sx={{ color: "primary.main" }}>Enquiries</Typography>
              <Button variant="outlined" size="small" onClick={fetchEnquiries}>Refresh</Button>
            </Stack>

            {loading ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading enquiries...</Typography>
              </Box>
            ) : enquiries.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography>No enquiries found.</Typography>
              </Box>
            ) : (
              <>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width={100}>ID</TableCell>
                      <TableCell width={200}>Name</TableCell>
                      <TableCell width={180}>Contact No</TableCell>
                      <TableCell width={260}>Address</TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell align="right" width={120}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginated.map((q) => (
                      <TableRow key={q.id} hover>
                        <TableCell>{q.id}</TableCell>
                        <TableCell>{q.name}</TableCell>
                        <TableCell>{q.contactNo}</TableCell>
                        <TableCell>{q.address}</TableCell>
                        <TableCell>{q.message}</TableCell>
                        <TableCell align="right">
                          <Button color="error" variant="outlined" size="small" onClick={() => handleDelete(q.id)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={enquiries.length}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[10, 25, 50]}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
