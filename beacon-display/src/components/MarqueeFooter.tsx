interface MarqueeFooterProps {
  message: string;
}

export function MarqueeFooter({ message }: MarqueeFooterProps) {
  return (
    <div className="w-full h-7 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 py-1 overflow-hidden flex items-center">
      <div className="animate-marquee-slow whitespace-nowrap inline-block">
        <span className="text-sm font-semibold text-white">{message}</span>
      </div>
    </div>
  );
}
