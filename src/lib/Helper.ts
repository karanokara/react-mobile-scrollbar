


/**
 * return class name
 * @param string 
 */
export function cn(...a: (null | undefined | string | string[] | boolean)[]) {
    let re: string[] = [];
    for (let i = 0; i < a.length; ++i) {
        let b = a[i];
        if (b == null || typeof b === "boolean")
            continue;

        if (Array.isArray(b)) {
            re.push(cn(...b));
        }
        else
            re.push(b);
    }
    return re.join(' ').replace(/\s+/g, ' ').trim();
}




export function isTouchDevice(): boolean {
    return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
    );
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}