import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        // SidebarProvider otomatis mendeteksi ukuran layar
        <SidebarProvider>
            {/* Panggil komponen AppSidebar yang baru kita buat */}
            <AppSidebar />

            <main className="flex-1 w-full bg-gray-50">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 bg-white">
                    {/* Tombol Hamburger ini akan otomatis muncul di HP dan hilang di Laptop! */}
                    <SidebarTrigger />
                    <h1 className="ml-4 font-semibold">Dashboard</h1>
                </div>

                {/* Area Konten Utama */}
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}