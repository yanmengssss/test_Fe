export interface HistoryCardType {
  id: number;
  cityName: string;
  cityId: string;
  date: number;
  type: string[];
  unit: string;
  advanced: string[];
  lat: string;
  lon: string;
}
export enum ActionType {
  ADD = "ADD",
  DEL = "DEL",
  RESHOWN = "RESHOWN",
  INIT = "INIT",
}
