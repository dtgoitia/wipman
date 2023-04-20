interface TodoArgs {
  message?: string;
}
export function todo(args: TodoArgs | undefined = undefined): never {
  throw new Error(args && args.message ? args.message : "TODO");
}

export function unreachable(
  args: { message: string } | undefined = undefined
): Error {
  return new Error(args && args.message ? args.message : "TODO");
}
