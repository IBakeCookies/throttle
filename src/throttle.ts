export function throttle(cb, opts) {
    let timeoutId = null;
    let then = 0;

    function _throttle(...args) {
        const now = performance.now();

        then = then || now;

        clearTimeout(timeoutId);

        if (now - then > opts.delay) {
            then = now;

            console.log('then');

            return new Promise((resolve) => {
                resolve(cb(...args));
            });
        }

        return new Promise((resolve) => {
            timeoutId = setTimeout(() => {
                then = now;

                console.log('timeout');
                resolve(cb(...args));
            }, opts.delay);
        });
    }

    _throttle.cancel = () => {
        clearTimeout(timeoutId);
    };

    return _throttle;
}

export function wait(milliseconds: number = 0): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), milliseconds);
    });
}
