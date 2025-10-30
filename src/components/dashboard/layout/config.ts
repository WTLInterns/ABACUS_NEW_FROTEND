import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

// Default navigation items (for backward compatibility)
export const navItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'customers', title: 'Customers', href: paths.dashboard.customers, icon: 'users' },
  { key: 'integrations', title: 'Integrations', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];

// Teacher navigation items
export const teacherNavItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.teacher, icon: 'chart-pie' },
  { key: 'student-enrollment', title: 'Student Enrollment', href: paths.dashboard.studentEnrollment, icon: 'users' },
  { key: 'manage-students', title: 'Manage Students', href: paths.dashboard.students, icon: 'graduation-cap' },
  { key: 'promote-student', title: 'Promote Student', href: paths.dashboard.promoteStudent, icon: 'arrow-up' },
  // { key: 'pending-approval', title: 'Student Pending for Approval', href: paths.dashboard.pendingApproval, icon: 'clock' },
  // { key: 'marks-entry', title: 'Student Marks Entry', href: paths.dashboard.marksEntry, icon: 'pencil' },
  { key: 'student-marks', title: 'Student Marks', href: paths.dashboard.studentMarks, icon: 'chart-line' },
  { key: 'competition', title: 'Competition', href: paths.dashboard.competition, icon: 'trophy' },
  { key: 'assign-competition', title: 'Assign Competition', href: paths.dashboard.assignCompetition, icon: 'users' },
  { 
    key: 'reports', 
    title: 'Reports', 
    href: paths.dashboard.reports, 
    icon: 'file-text',
    items: [
      { key: 'certificate', title: 'Certificate', href: paths.dashboard.reports + '/certificate' },
      { key: 'ledger', title: 'Ledger Report', href: paths.dashboard.ledgerReport }
    ]
  },
] satisfies NavItemConfig[];


// Admin navigation items (for MASTER_ADMIN)
export const adminNavItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.admin, icon: 'chart-pie' },
  { key: 'teachers', title: 'Teachers', href: paths.dashboard.teachers, icon: 'users' },
  { key: 'students', title: 'Manage Students', href: paths.dashboard.adminStudents, icon: 'graduation-cap' },
  { key: 'standards', title: 'Manage Standards', href: paths.dashboard.standards, icon: 'list-numbers' },
  { key: 'levels', title: 'Manage Levels', href: paths.dashboard.levels, icon: 'chart-bar' },
  { key: 'inventory', title: 'Manage Inventory', href: paths.dashboard.inventory, icon: 'package' },
  { key: 'competition', title: 'Manage Competitions', href: paths.dashboard.competition, icon: 'trophy' },
] satisfies NavItemConfig[];

// Master Admin navigation items (if different from admin)
export const masterAdminNavItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.admin, icon: 'chart-pie' },
  { key: 'teachers', title: 'Teachers', href: paths.dashboard.teachers, icon: 'users' },
  { key: 'students', title: 'Manage Students', href: paths.dashboard.adminStudents, icon: 'graduation-cap' },
  { key: 'standards', title: 'Manage Standards', href: paths.dashboard.standards, icon: 'list-numbers' },
  { key: 'levels', title: 'Manage Levels', href: paths.dashboard.levels, icon: 'chart-bar' },
  { key: 'inventory', title: 'Manage Inventory', href: paths.dashboard.inventory, icon: 'package' },
  { key: 'competition', title: 'Manage Competitions', href: paths.dashboard.competition, icon: 'trophy' },
] satisfies NavItemConfig[];