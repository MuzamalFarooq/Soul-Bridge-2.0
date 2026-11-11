import SoulBridgeLoader from '@/components/ui/SoulBridgeLoader';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center w-full">
      <SoulBridgeLoader fullScreen={false} />
    </div>
  );
}

