import App from "./App";
import "./index.css";
import { Admin } from "./lib/domain/admin";
import { OperationsManager } from "./lib/domain/operations";
import { SettingsManager } from "./lib/domain/settings";
import { TagManager } from "./lib/domain/tag";
import { TaskManager } from "./lib/domain/task";
import { ViewManager } from "./lib/domain/view";
import { Wipman } from "./lib/domain/wipman";
import { WipmanApi } from "./services/api";
import { ErrorsService } from "./services/errors";
import { Storage as BrowserStorage } from "./services/persistence/localStorage";
import { Storage } from "./services/persistence/persist";
import { GlobalStyle } from "./style/globalStyle";
import { activeTheme } from "./style/globalStyle";
import "./style/primereact";
import React, { useContext } from "react";
import { createContext } from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

const isLocalhost = window.location.hostname === "localhost";

const updateSW = registerSW({
  onNeedRefresh: function () {
    if (
      isLocalhost ||
      confirm("There is an newer version of this app. Do you want to update?")
    ) {
      updateSW(true);
    }
  },
});

const taskManager = new TaskManager();
const viewManager = new ViewManager({ taskManager });
const tagManager = new TagManager();
const operationsManager = new OperationsManager();
const browserStorage = new BrowserStorage();
const settingsManager = new SettingsManager();
const admin = new Admin({ local: browserStorage });
const errors = new ErrorsService();
const api = new WipmanApi({ errors, settingsManager });
const storage = new Storage({
  settingsManager,
  browserStorage,
  api,
  taskManager,
  viewManager,
});
const wipman = new Wipman({
  settingsManager,
  admin,
  storage,
  taskManager,
  viewManager,
  tagManager,
  operationsManager,
  errors,
});

const WipmanContext = createContext(wipman);
export function useWipman(): Wipman {
  return useContext(WipmanContext);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <GlobalStyle theme={activeTheme} />

    <WipmanContext.Provider value={wipman}>
      <App />
    </WipmanContext.Provider>
  </React.StrictMode>
);
