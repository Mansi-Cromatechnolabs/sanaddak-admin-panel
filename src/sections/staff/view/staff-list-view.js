'use client';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  TableContainer,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export default function StaffListView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Staff', href: paths.staff.list },
          { name: 'List' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.staff.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New User
          </Button>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>phone number</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            <TableRow>
              <TableCell>{1}</TableCell>
              <TableCell> user 1</TableCell>
              <TableCell> user1@gmail.com</TableCell>
              <TableCell> 123654789</TableCell>
              <TableCell> Admin</TableCell>
              <TableCell align="center">
                <IconButton>
                  <EditIcon />
                </IconButton>

                <IconButton>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableBody>

          {/* <TableFooter>
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ color: 'text.secondary' }}>
                No Data Found
              </TableCell>
            </TableRow>
          </TableFooter> */}
        </Table>
      </TableContainer>
    </Container>
  );
}

// ----------------------------------------------------------------------

// function applyFilter({ inputData, comparator, filters }) {
//   const { name, status, role } = filters;

//   const stabilizedThis = inputData.map((el, index) => [el, index]);

//   stabilizedThis.sort((a, b) => {
//     const order = comparator(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });

//   inputData = stabilizedThis.map((el) => el[0]);

//   if (name) {
//     inputData = inputData.filter(
//       (user) => user.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
//     );
//   }

//   if (status !== 'all') {
//     inputData = inputData.filter((user) => user.status === status);
//   }

//   if (role.length) {
//     inputData = inputData.filter((user) => role.includes(user.role));
//   }

//   return inputData;
// }
