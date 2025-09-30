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
  { key: 'promote-student', title: 'Promote Student', href: paths.dashboard.promoteStudent, icon: 'arrow-up' },
  { key: 'pending-approval', title: 'Student Pending for Approval', href: paths.dashboard.pendingApproval, icon: 'clock' },
  { key: 'marks-entry', title: 'Student Marks Entry', href: paths.dashboard.marksEntry, icon: 'pencil' },
  { key: 'competition', title: 'Competition', href: paths.dashboard.competition, icon: 'trophy' },
  { key: 'reports', title: 'Reports', href: paths.dashboard.reports, icon: 'file-text' },
] satisfies NavItemConfig[];

// Admin navigation items (for MASTER_ADMIN)
export const adminNavItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.admin, icon: 'chart-pie' },
  { key: 'teachers', title: 'Teachers', href: paths.dashboard.teachers, icon: 'users' },
  { key: 'students', title: 'Manage Students', href: paths.dashboard.students, icon: 'graduation-cap' },
  { key: 'inventory', title: 'Manage Inventory', href: paths.dashboard.inventory, icon: 'package' },
] satisfies NavItemConfig[];

// Master Admin navigation items (if different from admin)
export const masterAdminNavItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.admin, icon: 'chart-pie' },
  { key: 'teachers', title: 'Teachers', href: paths.dashboard.teachers, icon: 'users' },
  { key: 'students', title: 'Manage Students', href: paths.dashboard.students, icon: 'graduation-cap' },
  { key: 'inventory', title: 'Manage Inventory', href: paths.dashboard.inventory, icon: 'package' },
] satisfies NavItemConfig[];