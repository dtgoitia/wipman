import { customAlphabet } from "nanoid";

export const generateHash = customAlphabet("1234567890abcdef", 10);
