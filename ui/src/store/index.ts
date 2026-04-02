import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import favoritesReducer from "./favoritesSlice";
import { rootSaga } from "./sagas";

const middleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(middleware),
});

middleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
