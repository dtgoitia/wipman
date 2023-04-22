export function todo({ message }: { message?: string }): never {
  throw new Error(message ? message : "TODO");
}

export function unreachable(
  args: { message: string } | undefined = undefined
): Error {
  return new Error(args && args.message ? args.message : "TODO");
}
