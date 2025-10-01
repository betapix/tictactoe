import { useState, useEffect } from "react";
import { View, Text, Modal, Pressable, Linking, Platform, Share, TextInput, Vibration } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Utils from "../common/Utils";
import { Font, Sounds, Themes, ThemeName } from "../common/Const";

import Layout from "../components/Layout";
import Button from "../components/Button";
import Divider from "../components/Divider";
import GridItem from "../components/GridItem";
import GameModeSelector from "../components/GameModeSelector";

const winArrays = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  [0, 4, 8],
  [2, 4, 6],
];

const GameScreen: React.FC = () => {
  const [gameWith, setGameWith] = useState<"Bot" | "Player" | undefined>(
    undefined
  );
  const [showModePicker, setShowModePicker] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [effectsVolume, setEffectsVolume] = useState<number>(Utils.GetEffectsVolume());
  const [playerXName, setPlayerXName] = useState<string>("Player X");
  const [playerOName, setPlayerOName] = useState<string>("Player O");
  const [playerXEmoji] = useState<string>("😎");
  const [playerOEmoji] = useState<string>("🤖");
  const [firstMover, setFirstMover] = useState<"CROSS" | "ZERO">("CROSS");
  const [theme, setTheme] = useState<ThemeName>("midnight");

  const [turn, setTurn] = useState<"CROSS" | "ZERO">("CROSS");
  const [grids, setGrids] = useState<Array<"CROSS" | "ZERO" | undefined>>([
    ...new Array(9),
  ]);
  const [gameState, setGameState] = useState<"Game Over" | "Game Draw" | "">(
    ""
  );
  const [winner, setWinner] = useState<"CROSS" | "ZERO" | undefined>(undefined);
  const [winningIndexes, setWinningIndexes] = useState<Array<Array<number>>>(
    []
  );

  useEffect(() => {
    // load saved theme
    Utils.loadTheme().then((saved) => {
      if (saved && (Object.keys(Themes) as ThemeName[]).includes(saved as ThemeName)) {
        setTheme(saved as ThemeName);
      }
    });
  }, []);

  useEffect(() => {
    Utils.saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (grids.includes("CROSS") === false && grids.includes("ZERO") === false) {
      return;
    }

    const didSomeoneWon = checkWinner();
    if (didSomeoneWon) {
      setGameState("Game Over");
    } else if (didSomeoneWon === false && grids.includes(undefined) === false) {
      setGameState("Game Draw");
    } else {
      setTurn(turn === "CROSS" ? "ZERO" : "CROSS");
    }
  }, [grids]);

  useEffect(() => {
    //CHECK IF PLAYING AGAINTS BOT
    if (!isPaused && turn === "ZERO" && gameWith === "Bot") {
      onBotsTurn();
    }
  }, [turn]);

  useEffect(() => {
    if (gameState === "Game Over") {
      Utils.PlaySound(Sounds.Game_Won);
    } else if (gameState === "Game Draw") {
      Utils.PlaySound(Sounds.Game_Draw);
    }
  }, [gameState]);

  const onBotsTurn = async () => {
    await Utils.Sleep();
    //TAKE TURN AUTOMATICALLY
    let emptyIndexes: number[] = [];
    grids.map((grid, index) => {
      if (grid === undefined) {
        emptyIndexes.push(index);
      }
    });

    const botSelectedIndex = Math.floor(Math.random() * emptyIndexes.length);
    onGridPress(emptyIndexes[botSelectedIndex], true);
  };

  const checkWinner = (): boolean => {
    const winningIndexArray = winArrays.filter((winArr) => {
      const [first, second, third] = winArr;
      if (
        grids[first] !== undefined &&
        grids[first] === grids[second] &&
        grids[second] === grids[third]
      ) {
        return winArr;
      }
    });

    if (winningIndexArray.length > 0) {
      const [firstWinArray] = winningIndexArray;
      const winner = grids[firstWinArray[0]];
      setWinner(winner);
      setWinningIndexes(winningIndexArray);
      return true;
    }
    return false;
  };

  const onGridPress = (index: number, byBot?: boolean) => {
    if (!gameWith) return; // wait for mode selection
    if (isPaused) return;
    const canGameContinue = gameState.length === 0;
    let isValidTurn = true;
    if (gameWith === "Bot" && turn === "ZERO" && !byBot) {
      isValidTurn = false;
    }

    if (canGameContinue && isValidTurn && grids[index] === undefined) {
      let newGrids = [...grids];
      newGrids[index] = turn;
      setGrids([...newGrids]);
      Utils.PlaySound(Sounds.Move_Sound);
      Vibration.vibrate(10);
    }
  };

  const onReset = () => {
    setTurn(firstMover);
    setGrids([...new Array(9)]);
    setGameState("");
    setWinner(undefined);
    setWinningIndexes([]);
  };

  const onAgain = () => {
    // restart with the same mode
    onReset();
  };

  const onBackToMode = () => {
    // go back to mode selection
    onReset();
    setGameWith(undefined);
    setShowModePicker(true);
  };

  const isGameStarted = (): boolean => {
    return grids.filter((v) => v !== undefined).length !== 0;
  };

  const getTurnLabelText = (): string => {
    let emoji = "",
      text = "";
    if (!gameWith) {
      text = " Choose Mode ";
    } else if (gameState === "") {
      if (turn === "CROSS") {
        if (gameWith === "Bot") {
          text = "Your Turn";
        } else {
          text = "X's Turn";
        }
      } else {
        if (gameWith === "Bot") {
          text = "Bot's Turn";
        } else {
          text = "O's Turn";
        }
      }
    } else if (gameState === "Game Over") {
      emoji = "⭐";
      if (winner === "CROSS") {
        if (gameWith === "Bot") {
          text = " You Won ";
        } else {
          text = " X Won ";
        }
      } else {
        if (gameWith === "Bot") {
          text = " Bot Won ";
        } else {
          text = " O Won ";
        }
      }
    } else {
      emoji = "😑";
      text = " Draw ";
    }
    return `${emoji}${text}${emoji}`;
  };

  const isInWinIndex = (index: number): boolean => {
    const winIn = winningIndexes.flat();
    return winIn.includes(index);
  };

  return (
    <Layout style={{ justifyContent: "center" }}>
      {/* Top-right settings icon */}
      {gameWith && (
        <Pressable
          onPress={() => setShowSettings(true)}
          style={{ position: "absolute", top: 10, right: 10, padding: 8, borderWidth: 2, borderColor: Themes[theme].foreground, borderRadius: 6 }}
        >
          <Ionicons name="settings" size={22} color={Themes[theme].foreground} />
        </Pressable>
      )}
      {/* Startup Mode Picker */}
      <Modal visible={showModePicker} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 300,
              backgroundColor: Themes[theme].background,
              borderRadius: 8,
              padding: 16,
              borderWidth: 2,
              borderColor: Themes[theme].foreground,
            }}
          >
            <Text
              style={{
                fontFamily: Font.FontName,
                fontSize: 24,
                color: Themes[theme].foreground,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Choose Opponent
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <GameModeSelector
                title="Friend"
                onPress={() => {
                  setGameWith("Player");
                  setShowModePicker(false);
                  onReset();
                }}
                isSelected={gameWith === "Player"}
                disabled={false}
                style={{ marginHorizontal: 6 }}
              />
              <GameModeSelector
                title="Bot"
                onPress={() => {
                  setGameWith("Bot");
                  setShowModePicker(false);
                  onReset();
                }}
                isSelected={gameWith === "Bot"}
                disabled={false}
                style={{ marginHorizontal: 6 }}
              />
            </View>
          </View>
        </View>
      </Modal>
      {showModePicker ? null : gameWith ? (
        <View>
          <Text
            style={{
              fontFamily: Font.FontName,
              fontSize: 26,
              color: Themes[theme].foreground,
              textAlign: "center",
            }}
          >
            {gameWith === "Player" ? "Friend" : "Bot"}
          </Text>
          <Divider />
        </View>
      ) : (
      <View>
        <Text
          style={{
            fontFamily: Font.FontName,
            fontSize: 26,
              color: Themes[theme].foreground,
            textAlign: "center",
          }}
        >
          Opponent
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <GameModeSelector
            title="Friend"
            onPress={() => setGameWith("Player")}
            isSelected={gameWith === "Player"}
            disabled={isGameStarted()}
          />
          <GameModeSelector
            title="Bot"
            onPress={() => setGameWith("Bot")}
            isSelected={gameWith === "Bot"}
            disabled={isGameStarted()}
          />
        </View>
        <Divider />
      </View>
      )}
      <Text
        style={{
          fontFamily: Font.FontName,
          fontSize: 40,
          color: Themes[theme].foreground,
          textAlign: "center",
        }}
      >
        {getTurnLabelText()}
      </Text>
      {gameWith && (
        <Text style={{ fontFamily: Font.FontName, fontSize: 16, color: Themes[theme].foreground, textAlign: "center", marginBottom: 6 }}>
          {playerXEmoji} {playerXName} vs {playerOEmoji} {gameWith === "Bot" ? "Bot" : playerOName}
        </Text>
      )}
      <View
        style={{
          marginVertical: 12,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 300,
            height: 300,
            backgroundColor: Themes[theme].foreground,
            borderRadius: 6,
          }}
        >
          {[
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
          ].map(([ind1, ind2, ind3], i) => (
            <View style={{ flexDirection: "row" }} key={`${i}`}>
              <GridItem
                index={ind1}
                onPress={onGridPress}
                state={grids[ind1]}
                isWinningIndex={isInWinIndex(ind1)}
              />
              <GridItem
                index={ind2}
                onPress={onGridPress}
                state={grids[ind2]}
                isWinningIndex={isInWinIndex(ind2)}
              />
              <GridItem
                index={ind3}
                onPress={onGridPress}
                state={grids[ind3]}
                isWinningIndex={isInWinIndex(ind3)}
              />
            </View>
          ))}
        </View>
      </View>
      <Divider />

      {/* End of game modal */}
      <Modal visible={gameState !== ""} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 300,
              backgroundColor: Themes[theme].background,
              borderRadius: 8,
              padding: 16,
              borderWidth: 2,
              borderColor: Themes[theme].foreground,
            }}
          >
            <Text
              style={{
                fontFamily: Font.FontName,
                fontSize: 24,
                color: Themes[theme].foreground,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {getTurnLabelText()}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Button title={"Again"} onPress={onAgain} />
              <Button title={"Back"} onPress={onBackToMode} style={{ marginLeft: 8 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Settings modal */}
      <Modal visible={showSettings} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 320,
              backgroundColor: Themes[theme].background,
              borderRadius: 8,
              padding: 16,
              borderWidth: 2,
              borderColor: Themes[theme].foreground,
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-between" }}>
              <Pressable
                onPress={async () => {
                  const playUrl =
                    "https://play.google.com/store/apps/details?id=come.betaae.tic.tac.toe";
                  await Share.share({
                    message: `Play TicTacToe: ${playUrl}`,
                    title: "TicTacToe",
                  });
                }}
                style={{ padding: 10, borderWidth: 2, borderColor: Themes[theme].foreground, borderRadius: 8 }}
              >
                <Ionicons name="share-social" size={24} color={Themes[theme].foreground} />
              </Pressable>
              <Pressable
                onPress={() => {
                  const subject = encodeURIComponent("Bugs & Feature Requests");
                  const now = new Date();
                  const body = encodeURIComponent(
                    [
                      "Please describe your issue/request below:\n",
                      "",
                      "---",
                      `Name: <your name>`,
                      `Mobile Model: <your device model>`,
                      `OS: ${Platform.OS}`,
                      `Date/Time: ${now.toLocaleString()}`,
                      `Location: <your city, country>`,
                    ].join("\n")
                  );
                  const url = `mailto:beta.ae.dev@gmail.com?subject=${subject}&body=${body}`;
                  Linking.openURL(url);
                }}
                style={{ padding: 10, borderWidth: 2, borderColor: Themes[theme].foreground, borderRadius: 8 }}
              >
                <Ionicons name="mail" size={24} color={Themes[theme].foreground} />
              </Pressable>
              <Pressable
                onPress={onReset}
                style={{ padding: 10, borderWidth: 2, borderColor: Themes[theme].foreground, borderRadius: 8 }}
              >
                <Ionicons name="reload" size={24} color={Themes[theme].foreground} />
              </Pressable>
              <Pressable
                onPress={() => setIsPaused(!isPaused)}
                style={{ padding: 10, borderWidth: 2, borderColor: Themes[theme].foreground, borderRadius: 8 }}
              >
                <Ionicons name={isPaused ? "play" : "pause"} size={24} color={Themes[theme].foreground} />
              </Pressable>
              <Pressable
                onPress={() => {
                  const next = !audioEnabled;
                  setAudioEnabled(next);
                  Utils.SetAudioEnabled(next);
                }}
                style={{ padding: 10, borderWidth: 2, borderColor: Themes[theme].foreground, borderRadius: 8 }}
              >
                <Ionicons name={audioEnabled ? "volume-high" : "volume-mute"} size={24} color={Themes[theme].foreground} />
              </Pressable>
            </View>

            {/* Theme selector */}
            <View style={{ width: "100%", marginTop: 12 }}>
              <Text style={{ fontFamily: Font.FontName, color: Themes[theme].foreground, marginBottom: 6 }}>Theme</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {(Object.keys(Themes) as ThemeName[]).map((name) => (
                  <Pressable
                    key={name}
                    onPress={() => { setTheme(name); Utils.saveTheme(name); }}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderWidth: 1,
                      borderColor: Themes[theme].foreground,
                      borderRadius: 6,
                      marginRight: 8,
                      marginBottom: 8,
                      backgroundColor: theme === name ? Themes[theme].foreground : "transparent",
                    }}
                  >
                    <Text style={{ color: theme === name ? "#333027" : Themes[theme].foreground, fontFamily: Font.FontName }}>
                      {name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            {/* Names & avatars */}
            <View style={{ width: "100%", marginTop: 12 }}>
            <Text style={{ fontFamily: Font.FontName, color: Themes[theme].foreground, marginBottom: 6 }}>Players</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <TextInput
                    value={playerXName}
                    onChangeText={setPlayerXName}
                    placeholder="Player X name"
                    placeholderTextColor="#888"
                    style={{ borderWidth: 1, borderColor: Themes[theme].foreground, borderRadius: 6, padding: 8, color: Themes[theme].foreground }}
                  />
                </View>
                <View style={{ width: 60, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Themes[theme].foreground, borderRadius: 6 }}>
                  <Text style={{ fontSize: 22 }}>{playerXEmoji}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <TextInput
                    value={playerOName}
                    onChangeText={setPlayerOName}
                    placeholder="Player O name"
                    placeholderTextColor="#888"
                    style={{ borderWidth: 1, borderColor: Themes[theme].foreground, borderRadius: 6, padding: 8, color: Themes[theme].foreground }}
                  />
                </View>
                <View style={{ width: 60, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Themes[theme].foreground, borderRadius: 6 }}>
                  <Text style={{ fontSize: 22 }}>{playerOEmoji}</Text>
                </View>
              </View>
            </View>

            {/* First move & volume */}
            <View style={{ width: "100%", marginTop: 12 }}>
              <Text style={{ fontFamily: Font.FontName, color: Themes[theme].foreground, marginBottom: 6 }}>Settings</Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Pressable
                  onPress={() => setFirstMover(firstMover === "CROSS" ? "ZERO" : "CROSS")}
                  style={{ paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: Themes[theme].foreground, borderRadius: 6 }}
                >
                  <Text style={{ color: Themes[theme].foreground, fontFamily: Font.FontName }}>
                    First Move: {firstMover === "CROSS" ? "X" : "O"}
                  </Text>
                </Pressable>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Pressable onPress={() => { const v = Math.max(0, effectsVolume - 0.1); setEffectsVolume(v); Utils.SetEffectsVolume(v); }} style={{ padding: 6, borderWidth: 1, borderColor: Themes[theme].foreground, borderRadius: 6 }}>
                    <Text style={{ color: Themes[theme].foreground }}>-</Text>
                  </Pressable>
                  <Text style={{ color: Themes[theme].foreground, marginHorizontal: 8 }}>{Math.round(effectsVolume * 100)}%</Text>
                  <Pressable onPress={() => { const v = Math.min(1, effectsVolume + 0.1); setEffectsVolume(v); Utils.SetEffectsVolume(v); }} style={{ padding: 6, borderWidth: 1, borderColor: Themes[theme].foreground, borderRadius: 6 }}>
                    <Text style={{ color: Themes[theme].foreground }}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>
            <Pressable onPress={() => setShowSettings(false)} style={{ marginTop: 14 }}>
              <Ionicons name="close" size={26} color={Themes[theme].foreground} />
            </Pressable>
          </View>
      </View>
      </Modal>
    </Layout>
  );
};

export default GameScreen;
