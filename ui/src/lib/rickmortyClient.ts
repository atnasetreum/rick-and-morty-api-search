import {
  getCharacter as getCharacterFromClient,
  getCharacters as getCharactersFromClient,
  type Character as ApiCharacter,
  type Info,
} from "rickmortyapi";

export type Character = ApiCharacter;

export async function fetchCharacters(query?: string): Promise<Character[]> {
  const response = await getCharactersFromClient(
    query
      ? {
          name: query,
          page: 1,
        }
      : {
          page: 1,
        },
  );

  if (response.status === 404) {
    return [];
  }

  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusMessage || "Could not load characters");
  }

  const data = response.data as Info<Character[]>;
  return data.results ?? [];
}

export async function fetchFavoriteCharacters(
  ids: number[],
): Promise<Character[]> {
  if (!ids.length) {
    return [];
  }

  const response = await getCharacterFromClient(
    ids.length === 1 ? ids[0] : ids,
  );

  if (response.status < 200 || response.status >= 300) {
    return [];
  }

  const payload = response.data as Character | Character[];
  const list = Array.isArray(payload) ? payload : [payload];

  return ids
    .map((favoriteId) => list.find((character) => character.id === favoriteId))
    .filter((character): character is Character => Boolean(character));
}
