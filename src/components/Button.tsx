import { Pressable, Text, ViewStyle } from "react-native";

import { Font, Themes, ThemeName } from "../common/Const";
import Utils from "../common/Utils";
import { useEffect, useState } from "react";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({ title, onPress, style }) => {
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
    <Pressable
      onPress={onPress}
      style={{
        height: 60,
        backgroundColor: Themes[themeName].foreground,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 10,
        marginHorizontal: 10,
        flex: 1,
        ...style,
      }}
    >
      <Text
        style={{
          fontFamily: Font.FontName,
          fontSize: 25,
          color: "#333027",
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
};

export default Button;
