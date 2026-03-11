import { useState, useEffect } from "react";
import { useWeather } from "@/hooks/useWeather";
import { Clock, Cloud, MapPin } from "lucide-react";

export function InfoBar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { weather } = useWeather();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="info-bar fixed bottom-0 left-0 right-0 h-16 flex items-center justify-between px-8 z-50">
      {/* Date & Time */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-foreground">
          <Clock className="w-5 h-5 text-primary" />
          <span className="font-mono text-lg">{formatTime(currentTime)}</span>
        </div>
        <div className="text-muted-foreground">{formatDate(currentTime)}</div>
      </div>

      {/* Welcome Message */}
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        <span className="text-lg font-medium text-gradient">Welcome to KU</span>
      </div>

      {/* Weather */}
      <div className="flex items-center gap-4">
        {weather && (
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            <span className="text-2xl">{weather.icon}</span>
            <span className="font-medium">{weather.temp}°C</span>
            <span className="text-muted-foreground">{weather.description}</span>
          </div>
        )}
      </div>
    </div>
  );
}
