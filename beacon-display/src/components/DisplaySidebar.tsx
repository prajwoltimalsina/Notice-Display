import { useState, useEffect } from "react";
import { AnalogClock } from "./AnalogClock";
import { MapPin, Droplets, Wind } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";

export function DisplaySidebar() {
  const [time, setTime] = useState(new Date());
  const { weather, isLoading: weatherLoading } = useWeather("Kathmandu");

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      weekday: "short",
    });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="h-full w-45 flex flex-col bg-gradient-to-b from-blue-600 to-blue-800 text-white">
      {/* Analog Clock Section */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[180px]">
          <AnalogClock />
        </div>
      </div>

      {/* Weather Section */}
      <div className="bg-blue-900/50 px-4 py-3 border-t border-blue-500/30">
        <div className="flex items-center gap-2 text-blue-100 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">Kathmandu University</span>
        </div>
        {!weatherLoading && weather && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xl">{weather.icon}</span>
              <span className="text-2xl font-bold">{weather.temp}°C</span>
            </div>
            <p className="text-sm text-blue-200 capitalize">
              {weather.description}
            </p>
            {weather.humidity && weather.windSpeed && (
              <div className="flex items-center gap-4 text-xs text-blue-300">
                <div className="flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  <span>{weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="w-3 h-3" />
                  <span>{weather.windSpeed} km/h</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Date Section */}
      <div className="bg-blue-900/30 px-4 py-2 border-t border-blue-500/30">
        <p className="text-sm text-blue-200">{formatDate(time)}</p>
      </div>

      {/* Digital Time */}
      <div className="bg-blue-950 px-4 py-4 text-center">
        <p className="text-3xl font-bold tracking-wide">{formatTime(time)}</p>
        <p className="text-xs text-blue-300 mt-1 truncate">
          {formatFullDate(time)}
        </p>
      </div>
    </div>
  );
}
