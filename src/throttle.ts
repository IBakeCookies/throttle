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
    invoke: Callback<T, C>;
};

export function throttle<T, C>(handler: Callback<T, C>, opts: Options): Throttle<T, C> {
    let timeoutId = null;
    let isThrotteled = false;
    let result;
    let lastStartTime = 0;

    const options = {
        delay: 0,
        isLeading: false,
        ...opts,
    };

    function invoke(...args: C[]) {
        try {
            // console.log(args);

            result = handler(...args);
        } catch (error) {
            if (options.onError) {
                options.onError(error);
            }
        } finally {
            return result;
        }
    }

    function _throttle(...args: C[]) {
        if (options.isLeading) {
            if (isThrotteled) {
                return result;
            }

            isThrotteled = true;

            invoke(...args);

            setTimeout(() => {
                isThrotteled = false;
            }, options.delay);
        } else {
            const now = performance.now();
            lastStartTime = lastStartTime ? lastStartTime : now;

            // if (now - lastStartTime <= options.delay) {
            //     clearTimeout(timeoutId);
            //     lastStartTime = now;
            // }

            // if (now % opts.delay) {
            //     invoke(...args);
            // clearTimeout(timeoutId);
            // lastStartTime = now;
            // }

            clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
                invoke(...args);
                // lastStartTime = now;
            }, options.delay);
        }

        return result;
    }

    _throttle.cancel = () => {
        clearTimeout(timeoutId);
        isThrotteled = true;
    };

    _throttle.invoke = (...args: C[]) => invoke(...args);

    return _throttle;
}

const add = (num1: number, isNum1There: boolean): string => {
    return `${num1} ${isNum1There}`;
};

// const superHandler = throttle(add, {
// delay: 1000,
// isLeading: true,
// });

// const a = superHandler(false, 'awd');
