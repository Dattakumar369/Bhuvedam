export type WeatherCondition =
  | 'clear'
  | 'partlyCloudy'
  | 'cloudy'
  | 'rain'
  | 'thunderstorm'
  | 'fog'
  | 'snow';

export interface HourlyForecast {
  /** ISO timestamp from API — used to group hours by day */
  isoTime?: string;
  time: string;
  temperature: number;
  condition: WeatherCondition;
  precipitation: number;
}

export interface DailyForecast {
  date: string;
  day: string;
  /** e.g. "4 Aug" */
  dateLabel: string;
  high: number;
  low: number;
  condition: WeatherCondition;
  precipitation: number;
  humidity: number;
}

export interface WeatherData {
  location: string;
  current: {
    temperature: number;
    feelsLike: number;
    condition: WeatherCondition;
    humidity: number;
    windSpeed: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
    precipitation: number;
  };
  /** Default hourly strip — rest of today from current hour */
  hourly: HourlyForecast[];
  /** All hours keyed by YYYY-MM-DD for day picker */
  hourlyByDate?: Record<string, HourlyForecast[]>;
  daily: DailyForecast[];
  agricultureTip: string;
  updatedAt: string;
}
