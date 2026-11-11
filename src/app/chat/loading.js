import Navbar from '@/components/Navbar';
import ChatSkeleton from '@/components/ui/skeletons/ChatSkeleton';

export default function ChatLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ChatSkeleton />
      </main>
    </div>
  );
}

