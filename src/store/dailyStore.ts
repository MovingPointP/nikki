import { create } from "zustand";
import { readDir, readTextFile, writeTextFile, mkdir, remove } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { useSettingsStore } from "./settingsStore";
import { DEFAULT_TEMPLATE } from "../constants/defaultTemplate";
import { TEMPLATE_DIR, TEMPLATE_FILE } from "./templateStore";
import { getDayName } from "../utils/date";
import { DIARY_DIR, DIARY_FILE_PATTERN } from "../constants/diary";
import { splitFrontmatter, mergeFrontmatterAndContent, setTagsInFrontmatter, parseTags } from "../utils/frontmatter";

// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

interface DailyState {
  // スキャン済みの日付一覧（YYYY-MM-DD 形式）。カレンダー表示・存在確認に使う
  dateList: string[];

  // 現在開いている日記の日付（未選択なら null）
  currentDate: string | null;

  // フロントマター内部文字列（---区切りを含まない）
  frontmatter: string;

  // エディタの現在の内容（フロントマターを除いた本文のみ）
  content: string;

  // タグ名 → そのタグを持つ日付一覧（YYYY-MM-DD）のインデックス
  tagIndex: Record<string, string[]>;

  // 未保存の変更がある場合 true
  isDirty: boolean;

  // ファイル読み込み中の場合 true
  isLoading: boolean;

  // ファイル保存中の場合 true
  isSaving: boolean;

  // 起動時に diary/ フォルダをスキャンして dateList を構築する
  scanDiaryFiles: () => Promise<void>;

  // 指定日の日記を開く。ファイルがなければテンプレートを適用して新規状態にする
  openDiary: (dateStr: string) => Promise<void>;

  // エディタの入力内容を更新し、未保存状態にする
  setContent: (content: string) => void;

  // フロントマターの tags フィールドを更新し、未保存状態にする
  setTags: (tags: string[]) => void;

  // 現在の内容をファイルに保存する。新規の場合は dateList にも追加する
  saveDiary: () => Promise<void>;

  // 指定日の日記を削除する。開いている場合はエディタもリセットする
  deleteDiary: (dateStr: string) => Promise<void>;
}

// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

// tagIndex の指定日付のエントリを新しいタグ一覧で差分更新して返す
function updateTagIndexForDate(
  tagIndex: Record<string, string[]>,
  dateStr: string,
  newTags: string[]
): Record<string, string[]> {
  const updated: Record<string, string[]> = {};

  // 既存のインデックスから dateStr を除去する。空になったタグエントリは削除する
  for (const [tag, dates] of Object.entries(tagIndex)) {
    const filtered = dates.filter((d) => d !== dateStr);
    if (filtered.length > 0) updated[tag] = filtered;
  }

  // 新しいタグに dateStr を追加する（ソート順を維持する）
  for (const tag of newTags) {
    const existing = updated[tag] ?? [];
    if (!existing.includes(dateStr)) {
      updated[tag] = [...existing, dateStr].sort();
    }
  }

  return updated;
}

// settingsStore から保存パスを取得する
function getSavePath(): string | null {
  return useSettingsStore.getState().savePath;
}

// テンプレート文字列の {{date}} {{day}} を実際の値に展開する
function applyTemplate(template: string, dateStr: string): string {
  const day = getDayName(dateStr);
  return template.replace(/\{\{date\}\}/g, dateStr).replace(/\{\{day\}\}/g, day);
}

// カスタムテンプレートを読み込む。ファイルがなければ DEFAULT_TEMPLATE を返す
// templateStore.loadTemplate() は isDirty などのストア状態を書き換えるため、ここではreadTextFileを行う
async function readTemplateContent(savePath: string): Promise<string> {
  try {
    const filePath = await join(savePath, TEMPLATE_DIR, TEMPLATE_FILE);
    return await readTextFile(filePath);
  } catch {
    return DEFAULT_TEMPLATE;
  }
}

// ────────────────────────────────────────────
// ストア
// ────────────────────────────────────────────

export const useDailyStore = create<DailyState>((set, get) => ({
  dateList: [],
  currentDate: null,
  frontmatter: "",
  content: "",
  tagIndex: {},
  isDirty: false,
  isLoading: false,
  isSaving: false,

  // ── diary/ フォルダのスキャン ────────────────────────
  scanDiaryFiles: async () => {
    const savePath = getSavePath();
    // 保存フォルダ未設定の場合はスキャンしない
    if (!savePath) return;

    const diaryPath = await join(savePath, DIARY_DIR);
    // diary/ フォルダが未作成の場合（初回起動時など）は空リストで終了する
    let entries;
    try {
      entries = await readDir(diaryPath);
    } catch {
      set({ dateList: [], tagIndex: {} });
      return;
    }

    const dates = entries
      .map((entry) => entry.name ?? "")
      // YYYY-MM-DD.md 形式のファイルだけを対象にする
      .filter((name) => DIARY_FILE_PATTERN.test(name))
      // 拡張子を除いた日付文字列（YYYY-MM-DD）に変換する
      .map((name) => name.replace(".md", ""))
      .sort();

    // 全ファイルのフロントマターを並行して読み込み、タグを収集する
    const tagEntries = await Promise.all(
      dates.map(async (dateStr) => {
        try {
          const filePath = await join(savePath, DIARY_DIR, `${dateStr}.md`);
          const raw = await readTextFile(filePath);
          const { frontmatter } = splitFrontmatter(raw);
          return { dateStr, tags: parseTags(frontmatter) };
        } catch {
          return { dateStr, tags: [] as string[] };
        }
      })
    );

    // dates はソート済みなので各タグのリストも自動的に昇順になる
    const tagIndex: Record<string, string[]> = {};
    for (const { dateStr, tags } of tagEntries) {
      for (const tag of tags) {
        if (!tagIndex[tag]) tagIndex[tag] = [];
        tagIndex[tag].push(dateStr);
      }
    }

    set({ dateList: dates, tagIndex });
  },

  // ── 日記を開く ────────────────────────
  openDiary: async (dateStr: string) => {
    const savePath = getSavePath();
    if (!savePath) return;

    // 同じ日記がすでに開かれている場合は再読み込みしない
    if (get().currentDate === dateStr) return;

    set({ isLoading: true });

    try {
      const fileExists = get().dateList.includes(dateStr);
      let raw: string;

      if (fileExists) {
        const filePath = await join(savePath, DIARY_DIR, `${dateStr}.md`);
        raw = await readTextFile(filePath);
      } else {
        const template = await readTemplateContent(savePath);
        raw = applyTemplate(template, dateStr);
      }

      const { frontmatter, content } = splitFrontmatter(raw);
      set({ currentDate: dateStr, frontmatter, content, isDirty: false, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  // ── エディタ入力の反映 ────────────────────────
  setContent: (content: string) => {
    set({ content, isDirty: true });
  },

  // ── タグの更新 ────────────────────────
  setTags: (tags: string[]) => {
    const frontmatter = setTagsInFrontmatter(get().frontmatter, tags);
    set({ frontmatter, isDirty: true });
  },

  // ── 日記の保存 ────────────────────────
  saveDiary: async () => {
    const savePath = getSavePath();
    const { currentDate, frontmatter, content, dateList } = get();
    if (!savePath || !currentDate) return;

    set({ isSaving: true });

    try {
      const diaryPath = await join(savePath, DIARY_DIR);
      const filePath = await join(diaryPath, `${currentDate}.md`);

      // diary/ フォルダが存在しない場合に備えて作成する
      await mkdir(diaryPath, { recursive: true });
      await writeTextFile(filePath, mergeFrontmatterAndContent(frontmatter, content));

      // 新規作成の場合は dateList に追加してソートを維持する
      const newDateList = dateList.includes(currentDate)
        ? dateList
        : [...dateList, currentDate].sort();
      // 保存後のフロントマターからタグを取得し tagIndex を更新する
      const newTagIndex = updateTagIndexForDate(get().tagIndex, currentDate, parseTags(frontmatter));
      set({ isSaving: false, isDirty: false, dateList: newDateList, tagIndex: newTagIndex });
    } catch (e) {
      set({ isSaving: false });
      throw e;
    }
  },

  // ── 日記の削除 ────────────────────────
  deleteDiary: async (dateStr: string) => {
    const savePath = getSavePath();
    if (!savePath) return;

    const filePath = await join(savePath, DIARY_DIR, `${dateStr}.md`);
    await remove(filePath);

    const { currentDate, dateList, tagIndex } = get();

    // 削除した日記を開いている場合はエディタをリセットする
    const editorReset = currentDate === dateStr
      ? { currentDate: null, frontmatter: "", content: "", isDirty: false }
      : {};

    const newTagIndex = updateTagIndexForDate(tagIndex, dateStr, []);
    set({ dateList: dateList.filter((d) => d !== dateStr), tagIndex: newTagIndex, ...editorReset });
  },
}));
