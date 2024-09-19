export const handleLoader = (setCustomLoading, state, delay = 0) => {
    if (delay > 0) {
        setTimeout(() => setCustomLoading(state), delay);
    } else {
        setCustomLoading(state);
    }
};