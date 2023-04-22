export function todo({ message }: { message: string }): void {
  throw new Error(message ? message : "TODO");
}
