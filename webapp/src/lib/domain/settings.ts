import { unreachable } from "../devex";
import { Settings } from "./types";
import { Observable, Subject } from "rxjs";

export type SettingsChange =
  | { readonly kind: "SettingsInitialized" }
  | { readonly kind: "ApiUrlUpdated"; readonly value: string }
  | { readonly kind: "ApiUrlDeleted" }
  | { readonly kind: "ApiTokenUpdated"; readonly value: string }
  | { readonly kind: "ApiTokenDeleted" };

export class SettingsManager {
  public settings: Settings;
  public change$: Observable<SettingsChange>;

  private changeSubject: Subject<SettingsChange>;
  private initialized = false;

  constructor() {
    this.settings = {};
    this.changeSubject = new Subject<SettingsChange>();
    this.change$ = this.changeSubject.asObservable();
    this.change$.subscribe((change) =>
      console.debug(`${SettingsManager.name}.change$:`, change)
    );
  }

  public init(settings: Settings): void {
    if (this.initialized) {
      throw unreachable({
        message: `SettingsManager must be initialized only once`,
      });
    }
    this.settings = settings;
    this.initialized = true;
    this.changeSubject.next({ kind: "SettingsInitialized" });
  }

  public setApiUrl(value: string | undefined): void {
    if (value === undefined) {
      const { apiUrl, ...settings } = this.settings;
      this.settings = settings;
      this.changeSubject.next({ kind: "ApiUrlDeleted" });
    } else {
      this.settings = { ...this.settings, apiUrl: value };
      this.changeSubject.next({ kind: "ApiUrlUpdated", value });
    }
  }

  public setApiToken(value: string | undefined): void {
    if (value === undefined) {
      const { apiToken, ...settings } = this.settings;
      this.settings = settings;
      this.changeSubject.next({ kind: "ApiTokenDeleted" });
    } else {
      this.settings = { ...this.settings, apiToken: value };
      this.changeSubject.next({ kind: "ApiTokenUpdated", value });
    }
  }
}
