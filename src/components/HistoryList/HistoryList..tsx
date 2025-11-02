import { Card, Drawer } from "antd";
import { useCallback, useEffect, useState } from "react";
import { historyStore } from "../../store/history";
import type { HistoryCardType } from "./interface";
import dayjs from "dayjs";
import { typeMap } from "./data";
import { TYPE_OPTIONS } from "../WeatherDisplay/interface";
import { advancedMap, unitMap } from "../../common";
import { useSearchParams } from "react-router-dom";
export const HistoryList = () => {
  const [_, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(true);
  const [historyList, setHistoryList] = useState<HistoryCardType[]>([]);
  const store = historyStore();
  const onClose = () => {
    store?.setOpen(false);
  };
  const handleClick = useCallback(
    (history: HistoryCardType) => {
      setSearchParams({
        city: history.cityId,
        unit: history.unit,
        date: String(history.date),
        type: history.type.join(","),
        advanced: history.advanced.join(","),
      });
      const change = store?.change;
      store?.setChange(!change);
    },
    [setSearchParams, store]
  );
  useEffect(() => {
    if (store && store.open !== undefined) {
      setOpen(store.open);
    }
  }, [store?.open]);
  useEffect(() => {
    if (store && store.state.historyList !== undefined) {
      setHistoryList(store.state.historyList);
      console.log(store.state.historyList);
    }
  }, [store?.state.historyList]);
  return (
    <Drawer
      title="搜索历史"
      closable={{ "aria-label": "关闭" }}
      onClose={onClose}
      open={open}
    >
      {historyList.length > 0 ? (
        (historyList || []).map((history) => {
          const {
            id,
            cityName,
            date,
            type = [],
            unit,
            advanced = [],
          } = history;
          const typeList = type
            .map((item: string) => typeMap[item as TYPE_OPTIONS] || [])
            .join(",");
          const advancedList = advanced
            .map(
              (item: string) =>
                advancedMap[item as keyof typeof advancedMap] || []
            )
            .join(",");
          return (
            <Card
              key={id}
              className="mt-2"
              onClick={() => handleClick(history)}
            >
              <div>时间:{dayjs(id).format("YYYY-MM-DD HH:mm")}</div>
              <div>城市:{cityName}</div>
              <div>日期:{dayjs(date).format("YYYY-MM-DD HH:mm")}</div>
              <div>数据类型:{typeList || "--"}</div>
              <div>单位:{unitMap[unit as keyof typeof unitMap] || "--"}</div>
              <div>高级筛选:{advancedList || "--"}</div>
            </Card>
          );
        })
      ) : (
        <div>暂无历史记录</div>
      )}
    </Drawer>
  );
};
