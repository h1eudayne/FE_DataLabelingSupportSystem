// Logout is client-side only - no backend endpoint exists.
// Token invalidation is handled by clearing localStorage in auth.slice.js
const logoutApi = () => {
  return Promise.resolve({ success: true });
};

export default logoutApi;
