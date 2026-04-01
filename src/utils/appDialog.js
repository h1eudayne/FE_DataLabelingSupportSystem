import Swal from "sweetalert2";

const getCurrentTheme = () => {
  if (typeof document === "undefined") {
    return "light";
  }

  return (
    document.documentElement?.getAttribute("data-bs-theme") ||
    document.body?.getAttribute("data-bs-theme") ||
    "light"
  );
};

const normalizeVariant = (variant, icon) => {
  const normalizedVariant = String(variant || "").toLowerCase();
  if (normalizedVariant) {
    return normalizedVariant === "error" ? "danger" : normalizedVariant;
  }

  const normalizedIcon = String(icon || "info").toLowerCase();
  if (normalizedIcon === "error") {
    return "danger";
  }

  if (normalizedIcon === "question") {
    return "info";
  }

  return normalizedIcon;
};

const buildDialogOptions = ({
  variant,
  title,
  text,
  html,
  icon,
  confirmButtonText,
  cancelButtonText,
  showCancelButton = false,
  ...rest
}) => {
  const resolvedVariant = normalizeVariant(variant, icon);

  return {
    title,
    text,
    html,
    icon,
    confirmButtonText,
    cancelButtonText,
    showCancelButton,
    buttonsStyling: false,
    reverseButtons: showCancelButton,
    allowEscapeKey: true,
    allowOutsideClick: () => !Swal.isLoading(),
    customClass: {
      popup: `app-swal-popup app-swal-popup--${resolvedVariant} app-swal-theme--${getCurrentTheme()}`,
      title: "app-swal-title",
      htmlContainer: "app-swal-text",
      actions: "app-swal-actions",
      confirmButton: `app-swal-confirm app-swal-confirm--${resolvedVariant}`,
      cancelButton: "app-swal-cancel",
      closeButton: "app-swal-close",
    },
    ...rest,
  };
};

export const showConfirmDialog = ({
  title,
  text,
  html,
  icon = "warning",
  variant,
  confirmText = "Confirm",
  cancelText = "Cancel",
  ...rest
}) =>
  Swal.fire(
    buildDialogOptions({
      title,
      text,
      html,
      icon,
      variant,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      showCancelButton: true,
      ...rest,
    }),
  );

export const showStatusDialog = ({
  title,
  text,
  html,
  icon = "info",
  variant,
  confirmText = "Close",
  ...rest
}) =>
  Swal.fire(
    buildDialogOptions({
      title,
      text,
      html,
      icon,
      variant,
      confirmButtonText: confirmText,
      ...rest,
    }),
  );
