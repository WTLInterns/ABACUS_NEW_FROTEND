import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { StudentDetailsView } from '@/components/dashboard/admin/student-details-view';

export const metadata = { title: `Student Details | Admin | ${config.site.name}` } satisfies Metadata;

export default function StudentDetailsPage(): React.JSX.Element {
  return <StudentDetailsView />;
}