// This file is currently not in use but kept for future reference
export {};

// import * as React from 'react';
// import Box from '@mui/material/Box';
// import Card from '@mui/material/Card';
// import CardHeader from '@mui/material/CardHeader';
// import Chip from '@mui/material/Chip';
// import Divider from '@mui/material/Divider';
// import type { SxProps } from '@mui/material/styles';
// import Table from '@mui/material/Table';
// import TableBody from '@mui/material/TableBody';
// import TableCell from '@mui/material/TableCell';
// import TableHead from '@mui/material/TableHead';
// import TableRow from '@mui/material/TableRow';
// import { useTheme } from '@mui/material/styles';
// import IconButton from '@mui/material/IconButton';
// import { ArrowsClockwise as SwapIcon } from '@phosphor-icons/react/dist/ssr/ArrowsClockwise';

// export interface Student {
//   id: number;
//   firstName: string;
//   lastName: string;
//   currentLevel: string;
//   enrollMeantType: string;
// }

// export interface StudentLevelsProps {
//   students?: Student[];
//   enrollmentType: string;
//   onToggleEnrollment?: () => void;
//   sx?: SxProps;
// }

// export function StudentLevels({ 
//   students = [], 
//   enrollmentType, 
//   onToggleEnrollment,
//   sx 
// }: StudentLevelsProps): React.JSX.Element {
//   const theme = useTheme();

//   return (
//     <Card sx={sx}>
//       <CardHeader 
//         title="Student Levels" 
//         subheader={`Showing ${enrollmentType} students`}
//         action={
//           <IconButton onClick={onToggleEnrollment} aria-label="toggle enrollment">
//             <SwapIcon />
//           </IconButton>
//         }
//       />
//       <Divider />
//       <Box sx={{ overflowX: 'auto' }}>
//         <Table sx={{ minWidth: 500 }}>
//           <TableHead>
//             <TableRow>
//               <TableCell>ID</TableCell>
//               <TableCell>Name</TableCell>
//               <TableCell>Level</TableCell>
//               <TableCell>Program</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {students.map((student) => (
//               <TableRow hover key={student.id}>
//                 <TableCell>#{student.id}</TableCell>
//                 <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
//                 <TableCell>
//                   <Chip 
//                     label={student.currentLevel || 'Not Set'} 
//                     size="small" 
//                     color={student.currentLevel ? 'primary' : 'default'}
//                   />
//                 </TableCell>
//                 <TableCell>{student.enrollMeantType}</TableCell>
//               </TableRow>
//             ))}
//             {students.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={4} align="center">
//                   No students found
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </Box>
//     </Card>
//   );
// }