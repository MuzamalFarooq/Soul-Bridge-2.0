import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DashboardSkeleton from '@/components/ui/skeletons/DashboardSkeleton';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <DashboardSkeleton />
      </main>
      <Footer />
    </div>
  );
}

