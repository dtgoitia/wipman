import { STORAGE_PREFIX } from "../../config";

enum ValueType {
  string = "string",
  number = "number",
  object = "object",
}

class StoredItem<T> {
  private key: string;
  private type: string;
  constructor(key: string, type: ValueType) {
    this.key = key;
    this.type = type;
  }

  public exists(): boolean {
    const rawValue = window.localStorage.getItem(this.key);
    return !!rawValue;
  }

  public read(): T {
    if (!this.exists()) {
      throw new Error(`Could not find ${this.key} in local storage`);
    }

    const rawValue = window.localStorage.getItem(this.key) as string;

    switch (this.type) {
      case ValueType.string:
        return rawValue as unknown as T;

      case ValueType.number:
        return Number(rawValue) as unknown as T;

      case ValueType.object:
        return JSON.parse(rawValue);

      default:
        throw new Error(`Type ${this.type} is not supported yet`);
    }
  }

  public set(value: T) {
    this.assertType(value);

    let serializedValue = "";

    switch (this.type) {
      case ValueType.string:
        serializedValue = value as unknown as string;
        break;

      case ValueType.number:
        serializedValue = (value as unknown as number).toString();
        break;

      case ValueType.object:
        serializedValue = JSON.stringify(value);
        break;

      default:
        throw new Error(`Type ${this.type} is not supported yet`);
    }

    window.localStorage.setItem(this.key, serializedValue);
  }

  public delete() {
    if (!this.exists()) return;
    window.localStorage.removeItem(this.key);
  }

  private assertType(value: T): void {
    const actualType = typeof value;
    const expectedType = this.type;
    if (actualType !== expectedType) {
      throw new Error(`Expected ${expectedType}, got ${actualType} instead`);
    }
  }
}

export class Storage {
  tasks: StoredItem<object[] | undefined>;
  views: StoredItem<object[] | undefined>;
  lastBackendFetch: StoredItem<string | undefined>;
  settings: StoredItem<object | undefined>;

  constructor() {
    const prefix = STORAGE_PREFIX;
    this.tasks = new StoredItem(`${prefix}__tasks`, ValueType.object);
    this.views = new StoredItem(`${prefix}__views`, ValueType.object);
    this.lastBackendFetch = new StoredItem(
      `${prefix}__lastFetch`,
      ValueType.string
    );
    this.settings = new StoredItem(`${prefix}__settings`, ValueType.object);
  }
}

// DEPRECATION NOTE, 2023-04-20: use Storage instead
const browserStorage = new Storage();

// DEPRECATION NOTE, 2023-04-20: use Storage instead
export default browserStorage;
