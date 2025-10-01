import { Text, Pressable } from "react-native";
import { Font, ForegroundColor, Themes, ThemeName } from "../common/Const";
import Utils from "../common/Utils";
import { useEffect, useState } from "react";

interface GridItemProps {
  index: number;
  state: "ZERO" | "CROSS" | undefined;
  onPress: (index: number) => void;
  isWinningIndex: boolean;
}
const GridItem: React.FC<GridItemProps> = ({
  state,
  index,
  onPress,
  isWinningIndex,
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
      onPress={() => onPress(index)}
      style={{
        backgroundColor: Themes[themeName].background,
        height: 98,
        width: 98,
        margin: 1,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {state !== undefined ? (
        <Text
          style={{
            width: "100%",
            textAlign: "center",
            fontSize: isWinningIndex ? 65 : 55,
            fontFamily: Font.FontName,
            color: Themes[themeName].foreground,
            textShadowColor: isWinningIndex ? Themes[themeName].foreground : undefined,
            textShadowOffset: isWinningIndex
              ? { width: -1, height: 1 }
              : undefined,
            textShadowRadius: isWinningIndex ? 15 : undefined,
          }}
        >
          {state === "CROSS" ? "X" : "O"}
        </Text>
      ) : (
        <></>
      )}
    </Pressable>
  );
};

export default GridItem;
