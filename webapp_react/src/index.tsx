import App from "./App";
import "./blueprint.css";
import { Admin } from "./domain/admin";
import { OperationsManager } from "./domain/operations";
import { SettingsManager } from "./domain/settings";
import { TagManager } from "./domain/tag";
import { TaskManager } from "./domain/task";
import { ViewManager } from "./domain/view";
import { Wipman } from "./domain/wipman";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { WipmanApi } from "./services/api";
import { ErrorsService } from "./services/errors";
import { Storage as BrowserStorage } from "./services/persistence/localStorage";
import { Storage } from "./services/persistence/persist";
import { GlobalStyle } from "./style/globalStyle";
import { activeTheme } from "./style/globalStyle";
import BlueprintThemeProvider from "./style/theme";
import React from "react";
import ReactDOM from "react-dom";

// TODO: move this to a function that takes care of initializing all this for you - probably should live in wipman.ts
const taskManager = new TaskManager();
const viewManager = new ViewManager({ taskManager });
const tagManager = new TagManager();
const operationsManager = new OperationsManager();
const browserStorage = new BrowserStorage();
const settingsManager = new SettingsManager();
const admin = new Admin({ local: browserStorage });
const errors = new ErrorsService();
const api = new WipmanApi({ local: browserStorage, errors, settingsManager });
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

ReactDOM.render(
  <React.StrictMode>
    <GlobalStyle theme={activeTheme} />
    <BlueprintThemeProvider>
      <App wipman={wipman} />
    </BlueprintThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();