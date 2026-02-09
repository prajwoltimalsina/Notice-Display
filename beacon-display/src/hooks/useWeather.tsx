import { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

const WEATHER_ICONS: Record<string, string> = {
  'clear sky': '☀️',
  'few clouds': '🌤️',
  'scattered clouds': '⛅',
  'broken clouds': '☁️',
  'overcast clouds': '☁️',
  'shower rain': '🌧️',
  'rain': '🌧️',
  'light rain': '🌦️',
  'moderate rain': '🌧️',
  'heavy rain': '🌧️',
  'thunderstorm': '⛈️',
  'snow': '❄️',
  'mist': '🌫️',
  'haze': '🌫️',
  'fog': '🌫️',
};

export function useWeather(city: string = 'Dhulikhel') {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Using Open-Meteo API (free, no API key required)
        // Dhulikhel coordinates: 27.6189° N, 85.5456° E
        const lat = 27.6189;
        const lon = 85.5456;
        
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia/Kathmandu`
        );
        
        if (response.ok) {
          const data = await response.json();
          const current = data.current;
          
          // Map WMO weather codes to descriptions
          const weatherDescription = getWeatherDescription(current.weather_code);
          
          setWeather({
            temp: Math.round(current.temperature_2m),
            description: weatherDescription,
            icon: getWeatherIcon(weatherDescription),
            humidity: current.relative_humidity_2m,
            windSpeed: Math.round(current.wind_speed_10m),
          });
        }
      } catch (error) {
        console.error('Failed to fetch weather:', error);
        // Fallback to mock data
        setWeather({
          temp: 18,
          description: 'Partly Cloudy',
          icon: '⛅',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [city]);

  return { weather, isLoading };
}

function getWeatherDescription(code: number): string {
  const codes: Record<number, string> = {
    0: 'clear sky',
    1: 'few clouds',
    2: 'scattered clouds',
    3: 'overcast clouds',
    45: 'fog',
    48: 'fog',
    51: 'light rain',
    53: 'moderate rain',
    55: 'heavy rain',
    61: 'light rain',
    63: 'moderate rain',
    65: 'heavy rain',
    71: 'snow',
    73: 'snow',
    75: 'snow',
    80: 'shower rain',
    81: 'shower rain',
    82: 'heavy rain',
    95: 'thunderstorm',
    96: 'thunderstorm',
    99: 'thunderstorm',
  };
  return codes[code] || 'partly cloudy';
}

function getWeatherIcon(description: string): string {
  const lowerDesc = description.toLowerCase();
  return WEATHER_ICONS[lowerDesc] || '⛅';
}
