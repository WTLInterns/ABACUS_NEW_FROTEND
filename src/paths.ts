export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    teacher: '/dashboard/teacher',
    admin: '/dashboard/admin',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
    // Teacher specific paths
    studentEnrollment: '/dashboard/student-enrollment',
    students: '/dashboard/students',
    promoteStudent: '/dashboard/promote-student',
    pendingApproval: '/dashboard/pending-approval',
    marksEntry: '/dashboard/marks-entry',
    studentMarks: '/dashboard/student-marks',
    competition: '/dashboard/competition',
    reports: '/dashboard/reports',
    // Admin specific paths
    teachers: '/dashboard/teachers',
    adminStudents: '/dashboard/admin/students',
    standards: '/dashboard/admin/standards',
    levels: '/dashboard/admin/levels',
    inventory: '/dashboard/inventory',
  },
  errors: { notFound: '/errors/not-found' },
} as const;