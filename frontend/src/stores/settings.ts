import { makeAutoObservable } from "mobx";
import { getQueryHistory } from "../api/queries";
import { QueryRecord, RepositoryId } from "../types";

class Settings {
  currentRepository: RepositoryId | null = null;
  queryHistory: QueryRecord[] = [];
  darkMode: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setCurrentRepository(id: RepositoryId) {
    this.currentRepository = id;
    this.updateQueryHistory();
  }

  updateQueryHistory() {
    if (this.currentRepository) {
      getQueryHistory(this.currentRepository).then((queries) => {
        this.queryHistory = queries;
        console.log(queries);
      });
    }
  }

  setDarkMode(value: boolean) {
    this.darkMode = value;
  }
}

export default Settings;
