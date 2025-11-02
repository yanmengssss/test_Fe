import { message } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type FC,
  type ReactNode,
  type SetStateAction,
} from "react";

interface StoreContextType {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  messageApi: MessageInstance;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);
export const StoreProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  useEffect(() => {
    const key = "loading";
    if (loading) {
      messageApi.open({
        key,
        type: "loading",
        content: "获取数据中，请稍后...",
      });
    } else {
      messageApi.destroy(key);
    }
  }, [loading]);
  return (
    <StoreContext.Provider value={{ loading, setLoading, messageApi }}>
      {contextHolder}
      {children}
    </StoreContext.Provider>
  );
};

export const loadingStore = () => {
  const context = useContext(StoreContext);
  return context;
};
