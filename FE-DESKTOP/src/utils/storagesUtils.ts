export const safeGet = (obj: any, path: string, fallback: any = "-") => {
    return path.split(".").reduce((o, k) => (o?.[k]), obj) ?? fallback;
};