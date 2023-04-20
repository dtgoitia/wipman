export function todo({ message }: { message?: string }): never {
  throw new Error(message ? message : "TODO");
}

export function unexpected(message: string): never {
  throw new Error(`UNEXPECTED CODE PATH REACHED: ${message}`);
}
