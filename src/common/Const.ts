export type ThemeName = "midnight" | "sunset" | "emerald" | "classic";

export interface Theme {
  background: string;
  foreground: string;
}

export const Themes: Record<ThemeName, Theme> = {
  midnight: { background: "#212845", foreground: "#F8D332" },
  sunset: { background: "#2B1A2E", foreground: "#FF7A59" },
  emerald: { background: "#112d27", foreground: "#2ee6a6" },
  classic: { background: "#101010", foreground: "#ffffff" },
  ocean: { background: "#0f1b2b", foreground: "#4fd1ff" },
  rose: { background: "#2a0f16", foreground: "#ff5c8a" },
};

// Default theme
const BackgroundColor = Themes.midnight.background;
const ForegroundColor = Themes.midnight.foreground;

export { BackgroundColor, ForegroundColor };

export const Font = {
  FontName: "Kanit-Bold",
  FontFile: require("../../assets/Fonts/Kanit-Bold.ttf"),
};

export const Images = {
  ForkOnGithub: require("../../assets/ForkOnGithub.png"),
  Splash: require("../../assets/splash.png"),
};

export const Sounds = {
  Move_Sound: require("../../assets/Sounds/Move_Sound.wav"),
  Game_Draw: require("../../assets/Sounds/Game_Draw.wav"),
  Game_Won: require("../../assets/Sounds/Game_Won.wav"),
};
