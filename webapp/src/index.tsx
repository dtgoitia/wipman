import App from "./App";
import { Admin } from "./domain/admin";
import { OperationsManager } from "./domain/operations";
import { SettingsManager } from "./domain/settings";
import { TagManager } from "./domain/tag";
import { TaskManager } from "./domain/task";
import { ViewManager } from "./domain/view";
import { Wipman } from "./domain/wipman";
import "./index.css";
import { WipmanApi } from "./services/api";
import { ErrorsService } from "./services/errors";
import { Storage as BrowserStorage } from "./services/persistence/localStorage";
import { Storage } from "./services/persistence/persist";
import { GlobalStyle } from "./style/globalStyle";
import { activeTheme } from "./style/globalStyle";
import "./style/primereact";
import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh: function () {
    if (
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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <GlobalStyle theme={activeTheme} />
    <App wipman={wipman} />
  </React.StrictMode>
);
