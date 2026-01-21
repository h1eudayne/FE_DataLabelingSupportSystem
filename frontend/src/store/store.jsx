import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/auth.slice";
import labelingReducer from "./annotator/labelling/labelingSlice";
import taskReducer from "./annotator/labelling/taskSlice";
import projectReducer from "./manager/project/projectSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    labeling: labelingReducer,
    task: taskReducer,
    projects: projectReducer,
  },
});

export default store;
