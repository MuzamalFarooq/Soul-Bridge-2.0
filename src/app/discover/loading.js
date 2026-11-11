import Navbar from '@/components/Navbar';
import DiscoverSkeleton from '@/components/ui/skeletons/DiscoverSkeleton';

export default function DiscoverLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <DiscoverSkeleton />
      </main>
    </div>
  );
}

