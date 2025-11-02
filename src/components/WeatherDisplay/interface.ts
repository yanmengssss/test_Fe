import { unitMap } from "../../common";

export interface WeatherApiResponse {
  coord: { lon: number; lat: number };
  weather: { id: number; main: string; description: string; icon: string }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: { speed: number; deg: number };
  clouds: { all: number };
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export type unitType = keyof typeof unitMap;

export interface ForecastApiResponse {
  list: {
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level?: number;
      grnd_level?: number;
      humidity: number;
      temp_kf?: number;
    };
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    clouds: { all: number };
    wind: { speed: number; deg: number; gust?: number };
    visibility: number;
    pop?: number;
    sys: { pod: "d" | "n" };
    dt_txt: string;
  }[];
}

export enum TYPE_OPTIONS {
  CURRENT = "current",
  FORECAST = "forecast",
  AIR_QUALITY = "air_quality",
}
export interface AirQuality {
  co: number; // 一氧化碳 µg/m³
  no: number; // 一氧化氮 µg/m³
  no2: number; // 二氧化氮 µg/m³
  o3: number; // 臭氧 µg/m³
  so2: number; // 二氧化硫 µg/m³
  pm2_5: number; // PM2.5 µg/m³
  pm10: number; // PM10 µg/m³
  nh3: number; // 氨 µg/m³
}
export interface AirQualityApiResponse {
  list: {
    main: {
      aqi: number;
    };
    components: AirQuality;
    dt: number;
  }[];
}
