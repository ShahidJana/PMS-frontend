import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen h-screen flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 w-full overflow-y-auto py-6 px-4">{children}</main>
    </div>
  );
}
