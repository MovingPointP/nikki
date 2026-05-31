import { create } from "zustand";
import { load } from "@tauri-apps/plugin-store";
import { getCurrentWebview } from "@tauri-apps/api/webview";

// ────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────

// @tauri-apps/plugin-store が管理する設定ファイル名
const STORE_FILE = "settings.json";
// 日記の保存フォルダパスを格納するキー名
const KEY_SAVE_PATH = "savePath";
// ズームレベルを格納するキー名
const KEY_ZOOM_LEVEL = "zoomLevel";
// ズームの最小値・最大値・デフォルト値
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3.0;
const ZOOM_DEFAULT = 1.0;
// 1回のショートカット操作で変化するズーム量
const ZOOM_STEP = 0.1;

// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

// autoSave: false のため、読み書きのたびに明示的に save() を呼ぶ必要がある
const openStore = () => load(STORE_FILE, { autoSave: false, defaults: {} });

// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

interface SettingsState {
  // 日記の保存フォルダパス（未設定なら null）
  savePath: string | null;

  // 設定の読み込みが完了したか（App.tsx でローディング画面の制御に使う）
  isLoaded: boolean;

  // WebView のズームレベル（1.0 = 100%）
  zoomLevel: number;

  // 起動時に設定ファイルから保存パスを取得する
  loadSettings: () => Promise<void>;

  // 設定ファイルに保存パスを登録する
  setSavePath: (path: string) => Promise<void>;

  // WebView のズームレベルを変更し設定ファイルに保存する
  setZoomLevel: (level: number) => Promise<void>;

  // ズームを 1 ステップ拡大・縮小・リセットする
  zoomIn: () => Promise<void>;
  zoomOut: () => Promise<void>;
  zoomReset: () => Promise<void>;
}

// ────────────────────────────────────────────
// ストア
// ────────────────────────────────────────────

export const useSettingsStore = create<SettingsState>((set, get) => ({
  savePath: null,
  isLoaded: false,
  zoomLevel: ZOOM_DEFAULT,

  // ── 設定の読み込み ────────────────────────
  loadSettings: async () => {
    try {
      const store = await openStore();
      const savePath = await store.get<string>(KEY_SAVE_PATH);
      const zoomLevel = await store.get<number>(KEY_ZOOM_LEVEL);
      // キーが存在しない場合は undefined が返るため既定値に統一する
      set({ savePath: savePath ?? null, zoomLevel: zoomLevel ?? ZOOM_DEFAULT, isLoaded: true });
      // 保存済みのズームレベルを WebView に適用する
      await getCurrentWebview().setZoom(zoomLevel ?? ZOOM_DEFAULT);
    } catch {
      // 読み込み失敗時（初回起動・ファイル破損など）は未設定扱いで設定画面へ進める
      set({ savePath: null, isLoaded: true });
    }
  },

  // ── 保存パスの更新 ────────────────────────
  setSavePath: async (path: string) => {
    const store = await openStore();
    await store.set(KEY_SAVE_PATH, path);
    // autoSave: false のため明示的に save() を呼ぶ必要がある
    await store.save();
    set({ savePath: path, isLoaded: true });
  },

  // ── ズームレベルの更新 ────────────────────────
  setZoomLevel: async (level: number) => {
    // 浮動小数点数の精度問題を避けるため、小数点第1位に丸める
    const rounded = Math.round(level * 10) / 10;
    // ZOOM_MIN〜ZOOM_MAX の範囲に収める（範囲外の値が渡されても安全に動作させるため）
    const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, rounded));
    await getCurrentWebview().setZoom(clamped);
    set({ zoomLevel: clamped });
    const store = await openStore();
    await store.set(KEY_ZOOM_LEVEL, clamped);
    await store.save();
  },

  // ── ズーム操作のショートカット ────────────────────────
  zoomIn: () => get().setZoomLevel(get().zoomLevel + ZOOM_STEP),
  zoomOut: () => get().setZoomLevel(get().zoomLevel - ZOOM_STEP),
  zoomReset: () => get().setZoomLevel(ZOOM_DEFAULT),
}));
