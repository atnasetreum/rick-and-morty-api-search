import type { Character as ApiCharacter } from "rickmortyapi";

export type Character = ApiCharacter;

export type SelectedCharacterPayload = {
  id: number;
  characterId: number | null;
  character: Character | null;
};

export const DEFAULT_JSON_SERVER_PORT = "4000";

export function buildSelectedCharacterUrl(port?: string): string {
  const normalizedPort = port?.trim() || DEFAULT_JSON_SERVER_PORT;
  return `http://localhost:${normalizedPort}/selectedCharacter`;
}

export function isSelectedCharacterPayload(
  value: unknown,
): value is SelectedCharacterPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<SelectedCharacterPayload>;
  const hasValidId = typeof payload.id === "number";
  const hasValidCharacterId =
    payload.characterId === null || typeof payload.characterId === "number";
  const hasValidCharacter =
    payload.character === null || typeof payload.character === "object";

  return hasValidId && hasValidCharacterId && hasValidCharacter;
}
