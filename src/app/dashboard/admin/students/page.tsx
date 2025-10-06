import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { ManageStudents } from '@/components/dashboard/admin/manage-students';

export const metadata = { title: `Manage Students | Admin | ${config.site.name}` } satisfies Metadata;

export default function ManageStudentsPage(): React.JSX.Element {
  return <ManageStudents />;
}