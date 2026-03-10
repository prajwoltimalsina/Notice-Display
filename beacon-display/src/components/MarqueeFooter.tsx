interface MarqueeFooterProps {
  message: string;
}

export function MarqueeFooter({ message }: MarqueeFooterProps) {
  return (
    <div className="w-full bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 py-3 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap inline-block">
        <span className="text-lg font-semibold text-white">
          {message}
        </span>
      </div>
    </div>
  );
}
