import React from "react";
import { ToastContainer } from "react-toastify";

const AppToastHost = () => (
  <ToastContainer
    position="top-right"
    autoClose={3500}
    closeOnClick
    pauseOnHover
    draggable
    newestOnTop
    limit={4}
    theme="colored"
    toastClassName={() => "shadow-sm border-0 rounded-3"}
    bodyClassName={() => "small fw-medium"}
  />
);

export default AppToastHost;
