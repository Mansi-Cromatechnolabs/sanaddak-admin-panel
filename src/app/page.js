'use client';

import dynamic from 'next/dynamic';

import { GuestGuard } from 'src/auth/guard';
import AuthClassicLayout from 'src/layouts/auth/classic';

// import { JwtLoginView } from 'src/sections/auth/jwt';

const JwtLoginView = dynamic(
  () => import('src/sections/auth/jwt').then((mod) => mod.JwtLoginView),
  { ssr: false }
);

export default function HomePage() {
  return (
    <GuestGuard>
      <AuthClassicLayout>
        <JwtLoginView />
      </AuthClassicLayout>
    </GuestGuard>
  );
}
