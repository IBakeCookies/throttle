export function wait(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), milliseconds);
    });
}

interface Options {
    delay: number;
    isLeading?: boolean;
    onError?: (error: Error) => void;
}

type Callback<T, C> = (...args: C[]) => T | void;

type Throttle<T, C> = Callback<T, C> & {
    cancel: () => void;
    invoke: (...args: C[]) => T | void;
};

export function throttle<T, C>(cb: Callback<T, C>, opts: Options): Throttle<T, C> {
    let timeoutId = null;
    let then = 0;
    let result;

    function update(now, ...args) {
        then = now;

        try {
            result = cb(...args);
        } catch (error) {
            if (opts.onError) {
                opts.onError(error);
            }
        }
    }

    function _throttle(...args) {
        if (!opts.isLeading) {
            timeoutId && clearTimeout(timeoutId);

            const now = performance.now();

            then = then ?? now;

            if (now - then > opts.delay) {
                update(now, ...args);
            }

            timeoutId = setTimeout(() => {
                update(now, ...args);
            }, opts.delay);

            return result;
        }

        const now = performance.now();

        if (!then) {
            update(now, ...args);

            return result;
        }

        if (now - then > opts.delay) {
            update(now, ...args);
        }

        return result;
    }

    _throttle.cancel = () => {
        clearTimeout(timeoutId);
    };

    _throttle.invoke = (...args) => {
        const now = performance.now();

        update(now, ...args);
    };

    return _throttle;
}
