/* eslint-disable no-bitwise */
export function generateRandomKey() {
    return Math.random().toString(36).substr(2, 9);
}

// https://stackoverflow.com/a/52171480/
export function hashString(str: string, seed = 0) {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i += 1) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }

    h1 =
        Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
        Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 =
        Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
        Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

const placeholders = [
    '/defaultlogo/1.jpg',
    '/defaultlogo/2.jpg',
    '/defaultlogo/3.jpg',
    '/defaultlogo/4.jpg',
    '/defaultlogo/5.jpg',
    '/defaultlogo/6.jpg',
    '/defaultlogo/7.jpg',
];
export function selectRandomPlaceholder(id: string) {
    const hash = hashString(id);
    const index = hash % placeholders.length;
    return placeholders[index];
}
