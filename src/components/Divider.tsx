import { View } from "react-native";

import { Themes, ThemeName } from "../common/Const";
import Utils from "../common/Utils";
import { useEffect, useState } from "react";

const Divider = () => {
  const [themeName, setThemeName] = useState<ThemeName>("midnight");
  useEffect(() => {
    Utils.loadTheme().then((saved) => {
      if (saved && (Object.keys(Themes) as ThemeName[]).includes(saved as ThemeName)) {
        setThemeName(saved as ThemeName);
      }
    });
    const onTheme = (name: string) => {
      if ((Object.keys(Themes) as ThemeName[]).includes(name as ThemeName)) {
        setThemeName(name as ThemeName);
      }
    };
    Utils.addThemeListener(onTheme);
    return () => Utils.removeThemeListener(onTheme);
  }, []);
  return (
    <View
      style={{
        backgroundColor: Themes[themeName].foreground,
        height: 2,
        marginVertical: 10,
      }}
    />
  );
};

export default Divider;
