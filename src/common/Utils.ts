import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { AVPlaybackSource } from "expo-av/build/AV";

export default class Utils {
  //#region Utilities
  private static audioEnabled: boolean = true;
  private static effectsVolume: number = 1; // 0..1
  private static themeListeners: Array<(name: string) => void> = [];

  static SetAudioEnabled = (enabled: boolean) => {
    Utils.audioEnabled = enabled;
  };

  static IsAudioEnabled = () => Utils.audioEnabled;

  static SetEffectsVolume = (vol: number) => {
    // clamp 0..1
    Utils.effectsVolume = Math.max(0, Math.min(1, vol));
  };

  static GetEffectsVolume = () => Utils.effectsVolume;
  static Sleep = (seconds = 1) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, seconds * 1000);
    });
  };

  static PlaySound = async (audio: AVPlaybackSource) => {
    if (!Utils.audioEnabled) return;
    const { sound } = await Audio.Sound.createAsync(audio);
    try {
      await sound.setVolumeAsync(Utils.effectsVolume);
    } catch {}
    await sound.playAsync();
  };

  static IsOnWeb = () => Platform.OS === "web";

  //#region Theme helpers
  static async saveTheme(name: string) {
    try {
      await AsyncStorage.setItem("theme", name);
      Utils.notifyThemeChanged(name);
    } catch {}
  }
  static async loadTheme(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("theme");
    } catch {
      return null;
    }
  }

  static addThemeListener(cb: (name: string) => void) {
    Utils.themeListeners.push(cb);
  }
  static removeThemeListener(cb: (name: string) => void) {
    Utils.themeListeners = Utils.themeListeners.filter((f) => f !== cb);
  }
  private static notifyThemeChanged(name: string) {
    for (const cb of Utils.themeListeners) {
      try {
        cb(name);
      } catch {}
    }
  }
  //#endregion
}
