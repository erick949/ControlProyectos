import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout({ session, onLogout }) {
  return (
    <div className="min-h-screen w-full bg-surface-alt lg:flex">
      <Sidebar session={session} onLogout={onLogout} />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}