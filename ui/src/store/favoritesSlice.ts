import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./index";

export type FavoritesState = {
  items: number[];
  loading: boolean;
  error: string | null;
};

const initialState: FavoritesState = {
  items: [],
  loading: false,
  error: null,
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    loadFavoritesRequest(state) {
      state.loading = true;
      state.error = null;
    },
    loadFavoritesSuccess(state, action: PayloadAction<number[]>) {
      state.items = action.payload;
      state.loading = false;
    },
    loadFavoritesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    toggleFavoriteRequest(state, _action: PayloadAction<number>) {
      state.error = null;
    },
    toggleFavoriteSuccess(state, action: PayloadAction<number[]>) {
      state.items = action.payload;
    },
    toggleFavoriteFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
  },
});

export const {
  loadFavoritesRequest,
  loadFavoritesSuccess,
  loadFavoritesFailure,
  toggleFavoriteRequest,
  toggleFavoriteSuccess,
  toggleFavoriteFailure,
} = favoritesSlice.actions;

export const selectFavoriteIds = (state: RootState) => state.favorites.items;

export default favoritesSlice.reducer;
