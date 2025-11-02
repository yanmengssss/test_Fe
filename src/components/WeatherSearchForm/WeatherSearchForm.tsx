import {
  AutoComplete,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Radio,
  Select,
} from "antd";
import type {
  AutoCompleteProps,
  CheckboxOptionType,
  RadioGroupProps,
  SelectProps,
} from "antd";
import { useEffect, useState } from "react";
import { getCityList } from "../../apis";
import { debounce } from "../../utils";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { historyStore } from "../../store/history";
import { TYPE_OPTIONS } from "../WeatherDisplay/interface";
interface CityItem {
  name: string;
  local_names: Record<string, string>;
  lat: number;
  lon: number;
}

const defaultUnit = "metric";
export const WeatherSearchForm = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setOpen } = historyStore() || {};
  const [form] = Form.useForm();
  const type = Form.useWatch("type", form);
  const [cityOptions, setCityOptions] = useState<AutoCompleteProps["options"]>(
    []
  );
  const typeOptions: CheckboxOptionType<string>[] = [
    { label: "当前天气", value: "current", className: "label-1" },
    { label: "未来预报", value: "forecast", className: "label-2" },
    { label: "天气质量", value: "air_quality", className: "label-3" },
  ];

  const unitOptions: RadioGroupProps["options"] = [
    { label: "摄氏度", value: "metric", className: "label-1" },
    { label: "华氏度", value: "imperial", className: "label-2" },
  ];
  const advancedOptions: SelectProps["options"] = [
    { label: "风力等级>=3", value: "wind_speed_gte_3", className: "label-1" },
    { label: "湿度>=60%", value: "humidity_gte_60", className: "label-2" },
  ];
  const changeCityOptions = (searchText: string) => {
    if (searchText.trim().length < 2) {
      setCityOptions([]);
      return;
    }
    getCityList(searchText).then((res) => {
      const cityList = res as CityItem[];
      if (!cityList) return;
      const cityOptions = cityList.map((item) => {
        return {
          key: item.lat + "-" + item.lon,
          value: item.name,
          label: item.local_names["zh"],
        };
      });
      setCityOptions(cityOptions);
    });
  };
  const selectCity = (value: string) => {
    const city = cityOptions?.find((item) => item.value === value);
    if (city) {
      form.setFieldValue("city", city.label);
    }
  };
  const onFinish = (values: any) => {
    values["label"] = values["city"];
    console.log(values);
    Object.keys(values).forEach((key) => {
      if (key === "date") {
        values[key] = dayjs(values[key]).valueOf();
      }
      if (key === "type") {
        values[key] = values[key].join(",");
      }
      if (key == "city") {
        const city = cityOptions?.find((item) => item.label === values[key]);
        if (city) {
          values[key] = city.value;
          values["lat"] = city.key?.split("-")[0] || "";
          values["lon"] = city.key?.split("-")[1] || "";
        }
      }
    });
    setSearchParams(values);
  };
  const resetForm = () => {
    setSearchParams({});
    form.setFieldsValue({
      city: "",
      date: dayjs(),
      type: [],
      unit: defaultUnit,
      advanced: [],
    });
  };
  const debouncedSearch = debounce(changeCityOptions, 100);
  useEffect(() => {
    const city = searchParams.get("city");
    const date = searchParams.get("date");
    const type = searchParams.get("type");
    const unit = searchParams.get("unit");
    const advanced = searchParams.get("advanced");
    if (city) {
      getCityList(city).then((res) => {
        if (!res) return;
        const cityList = res as CityItem[];
        if (!cityList) return;
        form.setFieldValue("city", cityList[0].local_names["zh"]);
      });
    }
    form.setFieldsValue({
      city: "",
      date: date ? dayjs(Number(date)) : dayjs(),
      type: type ? type.split(",") : [],
      unit: unit || defaultUnit,
      advanced: advanced || [],
    });
  }, [historyStore()?.change]);
  return (
    <Card className="w-full bg-gray-200" title="搜索">
      <Form form={form} onFinish={onFinish}>
        <div className="flex gap-10">
          <Form.Item
            className="w-60"
            name="city"
            label="城市"
            rules={[{ required: true }]}
          >
            <AutoComplete
              options={cityOptions}
              onSelect={selectCity}
              onSearch={debouncedSearch}
              placeholder="请输入城市"
            />
          </Form.Item>
          <Form.Item name="date" label="日期范围" rules={[{ required: true }]}>
            <DatePicker
              defaultValue={dayjs()}
              disabledDate={(current) => {
                return (
                  current.isAfter(dayjs().add(6, "day"), "day") ||
                  current.isBefore(dayjs(), "day")
                );
              }}
            />
          </Form.Item>
        </div>
        <div className="flex gap-10">
          <Form.Item name="type" label="数据类型">
            <Checkbox.Group options={typeOptions} />
          </Form.Item>
          <Form.Item name="unit" label="单位设置" rules={[{ required: true }]}>
            <Radio.Group options={unitOptions} defaultValue={defaultUnit} />
          </Form.Item>
          <Form.Item className="w-60" name="advanced" label="高级筛选">
            <Select
              disabled={!type?.includes(TYPE_OPTIONS.CURRENT)}
              mode="multiple"
              allowClear
              placeholder="请筛选数据"
              options={advancedOptions}
            />
          </Form.Item>
        </div>
        <div className="flex gap-10">
          <Button type="default" onClick={resetForm}>
            重置
          </Button>
          <Button type="primary" htmlType="submit">
            搜索
          </Button>
          <Button type="primary" onClick={() => setOpen?.(true)}>
            查看历史
          </Button>
        </div>
      </Form>
    </Card>
  );
};
