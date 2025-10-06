import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { ManageStandards } from '@/components/dashboard/admin/manage-standards';

export const metadata = { title: `Manage Standards | Admin | ${config.site.name}` } satisfies Metadata;

export default function ManageStandardsPage(): React.JSX.Element {
  return <ManageStandards />;
}