import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const DEVICE_ID_KEY = "brief-app:device-id";

/**
 * Identifiant d'appareil généré à la première ouverture — sert de clé pour
 * app_users tant qu'il n'y a pas de vrai login (voir schema.sql).
 */
export async function getDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const id = Crypto.randomUUID();
  await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}
