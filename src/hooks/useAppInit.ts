import { useEffect } from "react";
import { useSettingsStore } from "../store/settingsStore";
import { useDailyStore } from "../store/dailyStore";
import { useMemoriesStore } from "../store/memoriesStore";
import { useModalStore } from "../store/modalStore";
import { toDateString } from "../utils/date";

// ────────────────────────────────────────────
// 起動シーケンス
// ────────────────────────────────────────────

// 設定変更時に Memories モーダルが再表示されないよう、初回起動時のみ表示するフラグ
let isFirstLoad = true;

export function useAppInit() {
  // 起動時に設定ファイルから savePath・zoomLevel を読み込む
  useEffect(() => {
    useSettingsStore.getState().loadSettings();
  }, []);

  const savePath = useSettingsStore((s) => s.savePath);

  // savePath が確定したらファイルスキャンを実行し、今日の日記を開く
  // 設定画面で savePath を新たに設定した場合にも再スキャン・再オープンされる
  useEffect(() => {
    if (!savePath) return;
    const dateStr = toDateString(new Date());
    const { scanDiaryFiles, openDiary } = useDailyStore.getState();
    (async () => {
      try {
        await scanDiaryFiles();
        await openDiary(dateStr);
        const { dateList } = useDailyStore.getState();
        await useMemoriesStore.getState().initTabs(dateList, dateStr);

        if (isFirstLoad) {
          isFirstLoad = false;
          const { tabs } = useMemoriesStore.getState();
          // アクティブなタブが1つ以上あるときのみモーダルを表示する
          if (tabs.some((t) => t.isActive)) {
            useModalStore.getState().openModal("memories");
          }
        }
      } catch (error) {
        console.error("Failed to initialize diary or memories:", error);
      }
    })();
  }, [savePath]);
}
