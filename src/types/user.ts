export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatar?: string;
  email?: string;
  role?: 'teacher' | 'admin' | 'master_admin';

  [key: string]: unknown;
}