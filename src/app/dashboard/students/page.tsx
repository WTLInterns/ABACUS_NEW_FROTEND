import * as React from 'react';
import type { Metadata } from 'next';
import { StudentList } from '@/components/dashboard/teacher-students';

export const metadata = { title: `Manage Students | Dashboard | Abacus` } satisfies Metadata;

export default function StudentsPage(): React.JSX.Element {
  return (
    <div>
      <StudentList />
    </div>
  );
}
