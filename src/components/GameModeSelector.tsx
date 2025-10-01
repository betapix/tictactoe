import { Pressable, Text, ViewStyle } from "react-native";

import { Font, Themes, ThemeName } from "../common/Const";
import Utils from "../common/Utils";
import { useEffect, useState } from "react";

interface GameModeSelectorProps {
  title: string;
  onPress?: () => void;
  isSelected: boolean;
  disabled: boolean;
  style?: ViewStyle;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  title,
  onPress,
  isSelected,
  disabled,
  style,
}) => {
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
        height: 44,
        backgroundColor: isSelected ? Themes[themeName].foreground : "transparent",
        borderRadius: 5,
        borderWidth: 2,
        borderColor: Themes[themeName].foreground,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 8,
        marginHorizontal: 4,
        flex: 1,
        ...style,
      }}
      disabled={disabled}
    >
      <Text
        style={{
          fontFamily: Font.FontName,
          fontSize: 22,
          color: isSelected ? "#333027" : Themes[themeName].foreground,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
};

export default GameModeSelector;
