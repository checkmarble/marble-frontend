import { Outlet } from '@remix-run/react';
import { Sidebar } from '../components/Sidebar';

export default function Index() {
  return (
    <div className="flex flex-1 flex-row">
      <Sidebar />

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
