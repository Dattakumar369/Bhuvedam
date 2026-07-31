export const WEATHER_CONDITIONS = {
  clear: { icon: 'weather-sunny', label: 'Clear' },
  partlyCloudy: { icon: 'weather-partly-cloudy', label: 'Partly Cloudy' },
  cloudy: { icon: 'weather-cloudy', label: 'Cloudy' },
  rain: { icon: 'weather-pouring', label: 'Rain' },
  thunderstorm: { icon: 'weather-lightning-rainy', label: 'Thunderstorm' },
  fog: { icon: 'weather-fog', label: 'Fog' },
  snow: { icon: 'weather-snowy', label: 'Snow' },
} as const;

export const WEATHER_UNITS = {
  temperature: '°C',
  wind: 'km/h',
  humidity: '%',
  pressure: 'hPa',
  visibility: 'km',
  uv: '',
} as const;
