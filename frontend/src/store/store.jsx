import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/auth.slice";
import labelingReducer from "./annotator/labelling/labelingSlice";
import taskReducer from "./annotator/labelling/taskSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    labeling: labelingReducer,
    task: taskReducer,
  },
});

export default store;
