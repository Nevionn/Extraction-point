import { open } from "@tauri-apps/plugin-dialog";

/**
 * Хук для выбора директории
 */

export const useSelectDirectory = (
  onStatusUpdate?: (status: string[]) => void,
) => {
  const selectDirectory = async (
    title: string,
    onChange: (value: string) => void,
  ) => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title,
      });

      if (selected) {
        onChange(selected as string);
      }
    } catch (error) {
      console.error("Ошибка выбора папки:", error);

      onStatusUpdate?.(["Ошибка выбора папки"]);
    }
  };

  return { selectDirectory };
};
