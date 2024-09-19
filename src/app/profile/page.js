'use client';

import dynamic from 'next/dynamic';
// import ProfileView from "src/sections/profile/ProfileView";

const ProfileView = dynamic(() => import('src/sections/profile/ProfileView'), {
  ssr: false,
});

export default function ProfilePage() {
  return <ProfileView />;
}
