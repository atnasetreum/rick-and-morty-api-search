import { getCharacter, getCharacters } from "rickmortyapi";
import { fetchCharacters, fetchFavoriteCharacters } from "./rickmortyClient";

jest.mock("rickmortyapi", () => ({
  getCharacters: jest.fn(),
  getCharacter: jest.fn(),
}));

const mockedGetCharacters = getCharacters as jest.MockedFunction<
  typeof getCharacters
>;
const mockedGetCharacter = getCharacter as jest.MockedFunction<
  typeof getCharacter
>;

describe("rickmortyClient.fetchCharacters", () => {
  it("queries rickmortyapi with name when query is provided", async () => {
    mockedGetCharacters.mockResolvedValueOnce({
      status: 200,
      data: { results: [{ id: 1, name: "Rick Sanchez" }] },
    } as never);

    const result = await fetchCharacters("Rick");

    expect(mockedGetCharacters).toHaveBeenCalledWith({ name: "Rick", page: 1 });
    expect(result).toHaveLength(1);
  });

  it("returns empty list on 404", async () => {
    mockedGetCharacters.mockResolvedValueOnce({ status: 404 } as never);

    const result = await fetchCharacters("unknown");

    expect(result).toEqual([]);
  });

  it("throws on non-2xx/404 response", async () => {
    mockedGetCharacters.mockResolvedValueOnce({
      status: 500,
      statusMessage: "Server error",
    } as never);

    await expect(fetchCharacters()).rejects.toThrow("Server error");
  });
});

describe("rickmortyClient.fetchFavoriteCharacters", () => {
  it("returns empty when ids are empty", async () => {
    const result = await fetchFavoriteCharacters([]);

    expect(result).toEqual([]);
    expect(mockedGetCharacter).not.toHaveBeenCalled();
  });

  it("queries single id as number and preserves order", async () => {
    mockedGetCharacter.mockResolvedValueOnce({
      status: 200,
      data: { id: 7, name: "Abradolf Lincler" },
    } as never);

    const result = await fetchFavoriteCharacters([7]);

    expect(mockedGetCharacter).toHaveBeenCalledWith(7);
    expect(result.map((item) => item.id)).toEqual([7]);
  });

  it("queries multiple ids and returns ordered/filtered list", async () => {
    mockedGetCharacter.mockResolvedValueOnce({
      status: 200,
      data: [
        { id: 10, name: "Alan Rails" },
        { id: 2, name: "Morty Smith" },
      ],
    } as never);

    const result = await fetchFavoriteCharacters([2, 99, 10]);

    expect(mockedGetCharacter).toHaveBeenCalledWith([2, 99, 10]);
    expect(result.map((item) => item.id)).toEqual([2, 10]);
  });

  it("returns empty list on non-2xx response", async () => {
    mockedGetCharacter.mockResolvedValueOnce({ status: 500 } as never);

    const result = await fetchFavoriteCharacters([1, 2]);

    expect(result).toEqual([]);
  });
});
