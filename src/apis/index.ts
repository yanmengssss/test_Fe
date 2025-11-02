import { request } from "../utils/request";
import type {
  AirQualityApiResponse,
  ForecastApiResponse,
  WeatherApiResponse,
} from "../components/WeatherDisplay/interface";
export const key = "c615f71048dc419b8ba25dff8e538306";
const defaultCnt = 3;
const lang = "zh_cn";
//城市列表
export const getCityList = (q: string) => {
  return request({
    url: "https://api.openweathermap.org/geo/1.0/direct",
    method: "GET",
    params: {
      q,
      limit: 5,
      appid: key,
    },
  });
};
//当前天气
export const getWeather = (
  city: string,
  unit: string
): Promise<WeatherApiResponse> => {
  return request({
    url: "https://api.openweathermap.org/data/2.5/weather",
    method: "GET",
    params: {
      q: city,
      appid: key,
      units: unit,
      lang,
    },
  });
};
//未来预报
export const getForecast = (
  city: string,
  unit: string
): Promise<ForecastApiResponse> => {
  return request({
    url: "https://api.openweathermap.org/data/2.5/forecast",
    method: "GET",
    params: {
      q: city,
      appid: key,
      units: unit,
      cnt: defaultCnt,
      lang,
    },
  });
};

//空气质量
export const getAirQuality = (
  lat: string,
  lon: string
): Promise<AirQualityApiResponse> => {
  return request({
    url: "https://api.openweathermap.org/data/2.5/air_pollution",
    method: "GET",
    params: {
      lat,
      lon,
      appid: key,
      lang,
    },
  });
};
