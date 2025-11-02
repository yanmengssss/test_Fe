import { HistoryList } from "./components/HistoryList/HistoryList.";
import { WeatherDisplay } from "./components/WeatherDisplay/WeatherDisplay";
import { WeatherSearchForm } from "./components/WeatherSearchForm/WeatherSearchForm";
import { StoreProvider as LoadingStoreProvider } from "./store/loading";
import { StoreProvider as HistoryStoreProvider } from "./store/history";

function App() {
  return (
    <>
      <LoadingStoreProvider>
        <HistoryStoreProvider>
          <WeatherSearchForm />
          <WeatherDisplay />
          <HistoryList />
        </HistoryStoreProvider>
      </LoadingStoreProvider>
    </>
  );
}

export default App;
