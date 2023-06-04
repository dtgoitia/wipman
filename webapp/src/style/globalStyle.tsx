import { createGlobalStyle } from "styled-components";

export enum Theme {
  light = "light",
  dark = "dark",
}

/*
interface ThemeColours {
  backgroundColor: string;
}

// TODO: support switching PrimeReact themes
// how to: https://stackoverflow.com/a/69010401
function getTheme(theme: Theme): ThemeColours {
  switch (theme) {
    case Theme.light:
      return {
        backgroundColor: "#F6F7F9",
      };
    case Theme.dark:
      return {
        backgroundColor: "#404854",
      };

    default:
      throw new Error("Requested theme is not supported");
  }
}
*/

export const activeTheme = Theme.light;

interface Props {
  theme: Theme;
}
export const GlobalStyle = createGlobalStyle<Props>`
  ul,
  ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }
`;
