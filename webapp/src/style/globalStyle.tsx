import { createGlobalStyle } from "styled-components";

export enum Theme {
  light = "light",
  dark = "dark",
}

interface ThemeColours {
  backgroundColor: string;
}

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
      throw Error("Requested theme is not supported");
  }
}

export const activeTheme = Theme.dark;

interface Props {
  theme: Theme;
}
export const GlobalStyle = createGlobalStyle<Props>`
  html {
    background-color: ${({ theme }) => getTheme(theme).backgroundColor};
  }

  ul,
  ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }
`;
