import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="h-screen flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-40">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 md:pl-72">
          <Navbar />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
