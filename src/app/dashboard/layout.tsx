import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:pl-72">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
