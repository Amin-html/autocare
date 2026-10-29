import fs from "node:fs";
import path from "node:path";

const EXTENSIONS = ["jpg", "jpeg", "webp", "png"];

/**
 * Ищет картинку в frontend/public/<dir>/<name>.(jpg|jpeg|webp|png).
 * Возвращает URL для next/image или null, если файла нет.
 * Только для серверных компонентов (использует fs).
 */
export function findPublicImage(dir: string, name: string): string | null {
  for (const ext of EXTENSIONS) {
    const file = path.join(process.cwd(), "public", ...dir.split("/"), `${name}.${ext}`);
    if (fs.existsSync(file)) return `/${dir}/${name}.${ext}`;
  }
  return null;
}
