import * as React from 'react';
import type { Metadata } from 'next';
import { config } from '@/config';

export const metadata = { title: `Test Teacher Profile | Admin Dashboard | ${config.site.name}` } satisfies Metadata;

export { default } from './test-profile-client';