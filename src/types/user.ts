export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatar?: string;
  email?: string;
  role?: 'teacher' | 'admin';

  [key: string]: unknown;
}