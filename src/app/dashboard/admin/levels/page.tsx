import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { ManageLevels } from '@/components/dashboard/admin/manage-levels';

export const metadata = { title: `Manage Levels | Admin | ${config.site.name}` } satisfies Metadata;

export default function ManageLevelsPage(): React.JSX.Element {
  return <ManageLevels />;
}