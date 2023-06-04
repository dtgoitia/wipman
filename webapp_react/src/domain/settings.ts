import { unreachable } from "../devex";
import { Settings } from "./types";
import { Observable, Subject } from "rxjs";

export type SettingsChange =
  | { readonly kind: "SettingsInitialized" }
  | { readonly kind: "ApiUrlUpdated"; readonly value: string }
  | { readonly kind: "ApiTokenUpdated"; readonly value: string };

export class SettingsManager {
  public settings: Settings;
  public change$: Observable<SettingsChange>;

  private changeSubject: Subject<SettingsChange>;
  private initialized: boolean = false;

  constructor() {
    this.settings = {};
    this.changeSubject = new Subject<SettingsChange>();
    this.change$ = this.changeSubject.asObservable();
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

  public setApiUrl(value: string): void {
    this.settings = { ...this.settings, apiUrl: value };
    this.changeSubject.next({ kind: "ApiUrlUpdated", value });
  }

  public setApiToken(value: string): void {
    this.settings = { ...this.settings, apiToken: value };
    this.changeSubject.next({ kind: "ApiTokenUpdated", value });
  }
}
