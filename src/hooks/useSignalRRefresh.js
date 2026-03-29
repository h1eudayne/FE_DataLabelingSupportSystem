import { useEffect, useRef } from "react";
import { subscribe } from "../services/signalrManager";
import { toast } from "react-toastify";


const useSignalRRefresh = (onRefresh, options = {}) => {
  const { enabled = true, showToast = true, toastPrefix = "" } = options;
  const onRefreshRef = useRef(onRefresh);

  
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !enabled) return;

    
    const unsubscribe = subscribe("ReceiveNotification", (notification) => {
      const message =
        notification?.Message || notification?.message || "New update";
      const type = notification?.Type || notification?.type || "info";

      console.log("[SignalR Refresh] Received:", message);

      
      if (showToast) {
        const toastMsg = toastPrefix ? `${toastPrefix}: ${message}` : message;
        if (type === "Success" || type === "success") {
          toast.success(toastMsg, { autoClose: 3000 });
        } else if (type === "Error" || type === "error") {
          toast.error(toastMsg, { autoClose: 4000 });
        } else {
          toast.info(toastMsg, { autoClose: 3000 });
        }
      }

      
      if (onRefreshRef.current) {
        onRefreshRef.current(notification);
      }
    });

    return unsubscribe;
  }, [enabled, showToast, toastPrefix]);
};

export default useSignalRRefresh;
