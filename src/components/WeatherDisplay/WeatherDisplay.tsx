import { Card, Progress, Table } from "antd";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAirQuality, getForecast, getWeather } from "../../apis";
import { unitMap } from "../../common";
import type { AirQuality, unitType } from "./interface";
import { TYPE_OPTIONS } from "./interface";
import dayjs from "dayjs";
import { loadingStore } from "../../store/loading";
import { ActionType, type HistoryCardType } from "../HistoryList/interface";
import { historyStore } from "../../store/history";
interface Weather {
  temp: number;
  humidity: number;
  wind_speed: number;
  weather: string;
  icon: string;
}
interface Forecast {
  date: string;
  maxTemp: string;
  minTemp: string;
  weather: string;
  icon: string;
}

const getIconUrl = (icon: string) => {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
};
const getAqiColorAndLabel = (aqi: number) => {
  if (aqi <= 50) return { color: "#52c41a", label: "优" };
  if (aqi <= 100) return { color: "#1890FF", label: "良" };
  if (aqi <= 150) return { color: "#faad14", label: "轻度污染" };
  if (aqi <= 200) return { color: "#fa541c", label: "中度污染" };
  if (aqi <= 300) return { color: "#f5222d", label: "重度污染" };
  return { color: "#722ed1", label: "严重污染" };
};
export const WeatherDisplay = () => {
  const location = useLocation();
  const { setLoading, messageApi } = loadingStore() || {};
  const { dispatch } = historyStore() || {};
  const [unit, setUnit] = useState<unitType>("metric");
  const [dataSource, setDataSource] = useState<Forecast[]>([]);
  const [currentType, setCurrentType] = useState<TYPE_OPTIONS[]>([]);
  const [airQuality, setAirQuality] = useState<AirQuality & { aqi: number }>({
    co: 0,
    no: 0,
    no2: 0,
    o3: 0,
    so2: 0,
    pm2_5: 0,
    pm10: 0,
    nh3: 0,
    aqi: 0,
  });
  const columns = [
    {
      title: "日期",
      dataIndex: "date",
      render: (date: string) => {
        return dayjs(date).format("YYYY-MM-DD HH:mm");
      },
    },
    {
      title: "最高温",
      dataIndex: "maxTemp",
    },
    {
      title: "最低温",
      dataIndex: "minTemp",
    },
    {
      title: "天气",
      dataIndex: "weather",
      render: (_: unknown, record: Forecast) => {
        return (
          <div className="flex items-center gap-2">
            <img
              className="w-10 h-10"
              src={getIconUrl(record.icon)}
              alt={record.icon}
            />
            <span>{record.weather}</span>
          </div>
        );
      },
    },
  ];

  const [weather, setWeather] = useState<Weather>({
    temp: 0,
    humidity: 0,
    wind_speed: 0,
    weather: "",
    icon: "",
  });
  const getDataSource = async (
    city: string,
    unit: string,
    lat: string,
    lon: string
  ) => {
    setLoading?.(true);
    let type = true;
    const [weatherRes, forecastRes, airRes] = await Promise.allSettled([
      getWeather(city, unit),
      getForecast(city, unit),
      getAirQuality(lat, lon),
    ]);
    if (
      currentType.includes(TYPE_OPTIONS.CURRENT) &&
      weatherRes.status === "fulfilled" &&
      weatherRes.value
    ) {
      const res = weatherRes.value;
      const weather = {
        temp: res.main.temp,
        humidity: res.main.humidity,
        wind_speed: res.wind.speed,
        weather: res.weather[0].description,
        icon: res.weather[0].icon,
      };
      setWeather(weather);
    } else if (weatherRes.status === "rejected") {
      messageApi?.error("获取天气失败:" + weatherRes.reason);
      type = false;
    }
    if (
      currentType.includes(TYPE_OPTIONS.FORECAST) &&
      forecastRes.status === "fulfilled" &&
      forecastRes.value
    ) {
      const res = forecastRes.value;
      const forecast = res.list.map((item: any) => ({
        date: item.dt_txt,
        maxTemp: item.main.temp_max + unitMap[unit as unitType],
        minTemp: item.main.temp_min + unitMap[unit as unitType],
        weather: item.weather[0].description,
        icon: item.weather[0].icon,
      }));
      setDataSource(forecast);
    } else if (forecastRes.status === "rejected") {
      messageApi?.error("获取未来天气失败:" + forecastRes.reason);
      type = false;
    }
    if (
      currentType.includes(TYPE_OPTIONS.AIR_QUALITY) &&
      airRes.status === "fulfilled" &&
      airRes.value
    ) {
      const res = airRes.value;
      setAirQuality({
        ...res.list[0].components,
        aqi: res.list[0].main.aqi,
      });
    } else if (airRes.status === "rejected") {
      messageApi?.error("获取空气质量失败:" + airRes.reason);
      type = false;
    }
    setLoading?.(false);

    console.log("获取数据完成！");
    if (type) {
      setTimeout(() => {
        messageApi?.success("获取数据完成！");
      }, 0);
    }
  };
  const saveHistory = (
    city: string,
    cityId: string,
    date: number,
    type: string[],
    unit: string,
    advanced: string[],
    lat: string,
    lon: string
  ) => {
    if (!dispatch) return;
    if (!cityId) return;
    const history = {
      cityName: city,
      cityId: cityId,
      date: date,
      type: type,
      lat: lat,
      lon: lon,
      unit: unit,
      advanced: advanced,
      id: new Date().getTime(),
    };
    dispatch({
      type: ActionType.ADD,
      payload: history as HistoryCardType,
    });
  };
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const label = searchParams.get("label") || "";
    const city = searchParams.get("city") || "";
    const unit = searchParams.get("unit") || "";
    const date = searchParams.get("date") || 0;
    const type = searchParams.get("type")?.split(",") || [];
    const advanced = searchParams.get("advanced")?.split(",") || [];
    const lat = searchParams.get("lat") || "";
    const lon = searchParams.get("lon") || "";
    console.log("解析到参数：", { city, unit, date, type, advanced, lat, lon });
    setCurrentType(type as TYPE_OPTIONS[]);
    if (city && unit) {
      setUnit(unit as unitType);
      getDataSource(city, unit, lat, lon);
      saveHistory(label, city, Number(date), type, unit, advanced, lat, lon);
    }
  }, [location]);
  return (
    <Card className="w-full bg-gray-200 mt-3" title="数据看板">
      {currentType.includes(TYPE_OPTIONS.CURRENT) && (
        <div>
          <div className=" font-bold mb-2">当前天气：</div>
          <div className=" flex gap-5 pl-4 items-center">
            <div>
              温度：
              <span>
                {weather.temp}
                {unitMap[unit]}
              </span>
            </div>
            <div>
              湿度：<span>{weather.humidity}%</span>
            </div>
            <div>
              风速：<span>{weather.wind_speed}m/s</span>
            </div>
            <div className="flex items-center gap-1">
              <div>天气状况：</div>
              {weather.icon && (
                <img
                  className="w-10 h-10"
                  src={getIconUrl(weather.icon)}
                  alt={weather.icon}
                />
              )}
              <div>{weather.weather || "--"}</div>
            </div>
          </div>
        </div>
      )}
      {currentType.includes(TYPE_OPTIONS.FORECAST) && (
        <div>
          <div className=" font-bold mt-4 mb-2">未来预报：</div>
          <Table dataSource={dataSource} columns={columns} pagination={false} />
        </div>
      )}
      {currentType.includes(TYPE_OPTIONS.AIR_QUALITY) && (
        <div>
          <div className=" font-bold mt-4 mb-2">空气质量：</div>
          <Card>
            <div className="flex justify-start items-center gap-2">
              <Progress
                className="w-auto"
                percent={(Math.min(airQuality.aqi, 500) / 500) * 100}
                strokeColor={getAqiColorAndLabel(airQuality.aqi).color}
                size={[400, 20]}
                percentPosition={{ align: "center", type: "inner" }}
              />
              <div>
                AQI:
                {`${airQuality.aqi} (${
                  getAqiColorAndLabel(airQuality.aqi).label
                }
                )`}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-1">
              <div>二氧化硫：{airQuality.so2}µg/m³</div>
              <div>二氧化氮：{airQuality.no2}µg/m³</div>
              <div>一氧化碳：{airQuality.co}µg/m³</div>
              <div>臭氧：{airQuality.o3}µg/m³</div>
              <div>PM2.5：{airQuality.pm2_5}µg/m³</div>
              <div>PM10：{airQuality.pm10}µg/m³</div>
              <div>氨：{airQuality.nh3}µg/m³</div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};
