export const isValidUrl = (string: string): boolean => {
    try {
        new URL(string);
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};