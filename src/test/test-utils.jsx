import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";

import authReducer from "../store/auth/auth.slice";

export function renderWithProviders(
  ui,
  {
    preloadedState = {
      auth: {
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      },
    },
    store = configureStore({
      reducer: { auth: authReducer },
      preloadedState,
    }),
  } = {},
) {
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter>{ui}</MemoryRouter>
      </Provider>,
    ),
  };
}
