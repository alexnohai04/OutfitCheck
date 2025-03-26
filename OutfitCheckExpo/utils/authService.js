let logoutHandler = null;

export const setLogoutHandler = (handler) => {
    logoutHandler = handler;
};

export const triggerLogout = () => {
    if (logoutHandler) {
        logoutHandler();
    } else {
        console.warn('⚠️ Logout handler not set!');
    }
};
