import { all, put, select, takeLatest } from "redux-saga/effects";
import {
  loadFavoritesFailure,
  loadFavoritesRequest,
  loadFavoritesSuccess,
  selectFavoriteIds,
  toggleFavoriteFailure,
  toggleFavoriteRequest,
  toggleFavoriteSuccess,
} from "./favoritesSlice";

const FAVORITES_STORAGE_KEY = "rm-favorites";

function safeReadFavorites(): number[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter((item): item is number => typeof item === "number");
}

function safeWriteFavorites(items: number[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
}

function* handleLoadFavorites() {
  try {
    const items: number[] = safeReadFavorites();
    yield put(loadFavoritesSuccess(items));
  } catch {
    yield put(loadFavoritesFailure("Could not load favorites"));
  }
}

function* handleToggleFavorite(
  action: ReturnType<typeof toggleFavoriteRequest>,
) {
  try {
    const current: number[] = yield select(selectFavoriteIds);
    const isFavorite = current.includes(action.payload);
    const next = isFavorite
      ? current.filter((id) => id !== action.payload)
      : [...current, action.payload];

    safeWriteFavorites(next);
    yield put(toggleFavoriteSuccess(next));
  } catch {
    yield put(toggleFavoriteFailure("Could not update favorites"));
  }
}

export function* rootSaga() {
  yield all([
    takeLatest(loadFavoritesRequest.type, handleLoadFavorites),
    takeLatest(toggleFavoriteRequest.type, handleToggleFavorite),
  ]);
}
