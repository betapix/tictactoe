import {
  View,
  SafeAreaView,
  ViewStyle,
  Image,
  Pressable,
  Linking,
} from "react-native";

import Utils from "../common/Utils";
import { Themes, ThemeName } from "../common/Const";
import { useEffect, useState } from "react";

interface LayoutProps {
  style?: ViewStyle;
}

const Layout: React.FC<LayoutProps> = ({ children, style }) => {
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
        backgroundColor: Themes[themeName].background,
        flex: 1,
        alignItems: "center",
      }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 480,
          padding: 15,
          borderColor: Themes[themeName].foreground,
          borderWidth: 2,
          ...style,
        }}
      >
        {children}
      </SafeAreaView>
      
    </View>
  );
};

export default Layout;
