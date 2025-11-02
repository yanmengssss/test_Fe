import {
  createContext,
  useReducer,
  useEffect,
  type FC,
  type ReactNode,
  useState,
  type Dispatch,
  type SetStateAction,
  useContext,
} from "react";
import type { HistoryCardType } from "../components/HistoryList/interface";
import { ActionType } from "../components/HistoryList/interface";
interface StoreState {
  historyList: HistoryCardType[];
}

type Action =
  | { type: ActionType.ADD; payload: HistoryCardType }
  | { type: ActionType.DEL; payload: HistoryCardType }
  | { type: ActionType.RESHOWN; payload: number }
  | { type: ActionType.INIT; payload: HistoryCardType[] };

interface StoreContextType {
  state: StoreState;
  dispatch: Dispatch<Action>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  change: boolean;
  setChange: Dispatch<SetStateAction<boolean>>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const reducer = (state: StoreState, action: Action): StoreState => {
  switch (action.type) {
    case ActionType.ADD: {
      const newHistory = { ...action.payload };
      const newHistoryList = [newHistory, ...state.historyList].slice(0, 5);
      return { ...state, historyList: newHistoryList };
    }

    case ActionType.DEL: {
      return {
        ...state,
        historyList: state.historyList.filter(
          (item) => item.cityId !== action.payload.cityId
        ),
      };
    }

    case ActionType.RESHOWN: {
      const id = action.payload;
      const history = state.historyList.find((item) => item.id === id);
      if (!history) return state;

      // 创建新数组，更新 id 并排序
      const updatedHistory = { ...history, id: new Date().getTime() };
      const newHistoryList = [
        updatedHistory,
        ...state.historyList.filter((item) => item.id !== id),
      ];
      return { ...state, historyList: newHistoryList };
    }

    case ActionType.INIT: {
      return { ...state, historyList: action.payload };
    }

    default:
      return state;
  }
};

// Provider 组件
export const StoreProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { historyList: [] });
  const [open, setOpen] = useState<boolean>(false);
  const [change, setChange] = useState<boolean>(false);
  useEffect(() => {
    localStorage.setItem("historyList", JSON.stringify(state.historyList));
  }, [state.historyList]);
  useEffect(() => {
    const historyList = localStorage.getItem("historyList");
    if (historyList && historyList.length > 0) {
      const parsedList = JSON.parse(historyList);
      if (Array.isArray(parsedList) && parsedList.length > 0) {
        dispatch({ type: ActionType.INIT, payload: parsedList });
      }
    }
  }, []);
  return (
    <StoreContext.Provider
      value={{ state, dispatch, open, setOpen, change, setChange }}
    >
      {children}
    </StoreContext.Provider>
  );
};

// 自定义 hook
export const historyStore = () => {
  const context = useContext(StoreContext);
  return context;
};
