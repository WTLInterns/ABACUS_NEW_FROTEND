export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
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
    promoteStudent: '/dashboard/promote-student',
    pendingApproval: '/dashboard/pending-approval',
    marksEntry: '/dashboard/marks-entry',
    competition: '/dashboard/competition',
    reports: '/dashboard/reports',
    // Admin specific paths
    teachers: '/dashboard/teachers',
    students: '/dashboard/students',
    inventory: '/dashboard/inventory',
  },
  errors: { notFound: '/errors/not-found' },
} as const;