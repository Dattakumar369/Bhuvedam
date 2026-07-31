export type WeatherCondition =
  | 'clear'
  | 'partlyCloudy'
  | 'cloudy'
  | 'rain'
  | 'thunderstorm'
  | 'fog'
  | 'snow';

export interface HourlyForecast {
  time: string;
  temperature: number;
  condition: WeatherCondition;
  precipitation: number;
}

export interface DailyForecast {
  date: string;
  day: string;
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
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  agricultureTip: string;
  updatedAt: string;
}
