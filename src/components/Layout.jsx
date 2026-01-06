import React from 'react';
import Navbar from './Navbar';
import Background from './Background';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen h-screen flex flex-col overflow-hidden relative">
      <Background />
      <Navbar />
      <main className="flex-1 w-full overflow-y-auto py-6 px-4 relative z-10">{children}</main>
    </div>
  );
}
