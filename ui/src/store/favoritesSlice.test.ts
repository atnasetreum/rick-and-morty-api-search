import favoritesReducer, {
  loadFavoritesFailure,
  loadFavoritesRequest,
  loadFavoritesSuccess,
  selectFavoriteIds,
  toggleFavoriteFailure,
  toggleFavoriteRequest,
  toggleFavoriteSuccess,
  type FavoritesState,
} from "./favoritesSlice";

describe("favoritesSlice", () => {
  const initialState: FavoritesState = {
    items: [],
    loading: false,
    error: null,
  };

  it("returns the initial state", () => {
    expect(favoritesReducer(undefined, { type: "unknown" })).toEqual(
      initialState,
    );
  });

  it("sets loading=true and clears error on loadFavoritesRequest", () => {
    const previous: FavoritesState = {
      items: [1],
      loading: false,
      error: "boom",
    };

    const next = favoritesReducer(previous, loadFavoritesRequest());

    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
    expect(next.items).toEqual([1]);
  });

  it("stores items and disables loading on loadFavoritesSuccess", () => {
    const previous: FavoritesState = {
      items: [],
      loading: true,
      error: null,
    };

    const next = favoritesReducer(previous, loadFavoritesSuccess([2, 5]));

    expect(next.items).toEqual([2, 5]);
    expect(next.loading).toBe(false);
  });

  it("stores error and disables loading on loadFavoritesFailure", () => {
    const previous: FavoritesState = {
      items: [],
      loading: true,
      error: null,
    };

    const next = favoritesReducer(
      previous,
      loadFavoritesFailure("Could not load"),
    );

    expect(next.loading).toBe(false);
    expect(next.error).toBe("Could not load");
  });

  it("clears error on toggleFavoriteRequest", () => {
    const previous: FavoritesState = {
      items: [10],
      loading: false,
      error: "Could not update",
    };

    const next = favoritesReducer(previous, toggleFavoriteRequest(10));

    expect(next.items).toEqual([10]);
    expect(next.error).toBeNull();
  });

  it("updates items on toggleFavoriteSuccess", () => {
    const previous: FavoritesState = {
      items: [3],
      loading: false,
      error: null,
    };

    const next = favoritesReducer(previous, toggleFavoriteSuccess([3, 4]));

    expect(next.items).toEqual([3, 4]);
  });

  it("stores error on toggleFavoriteFailure", () => {
    const previous: FavoritesState = {
      items: [3],
      loading: false,
      error: null,
    };

    const next = favoritesReducer(
      previous,
      toggleFavoriteFailure("Could not update"),
    );

    expect(next.error).toBe("Could not update");
  });

  it("selectFavoriteIds returns favorites ids", () => {
    const state = {
      favorites: {
        items: [1, 7, 9],
        loading: false,
        error: null,
      },
    } as { favorites: FavoritesState };

    expect(selectFavoriteIds(state as never)).toEqual([1, 7, 9]);
  });
});
