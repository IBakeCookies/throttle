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

    function invoke(...args) {
        try {
            result = handler(...args);
        } catch (error) {
            if (opts.onError) {
                opts.onError(error);
            }
        } finally {
            return result;
        }
    }

    function _throttle(...args) {
        if (isThrotteled) {
            return result;
        }

        isThrotteled = true;

        if (opts.isLeading) {
            invoke(...args);

            timeoutId = setTimeout(() => {
                isThrotteled = false;
            }, opts.delay);
        } else {
            timeoutId = setTimeout(() => {
                isThrotteled = false;

                invoke(...args);
            }, opts.delay);
        }

        return result;
    }

    _throttle.cancel = () => {
        clearTimeout(timeoutId);
        isThrotteled = true;
    };

    _throttle.invoke = (...args) => invoke(...args);

    return _throttle;
}

const add = (num1: number, isNum1There: boolean): string => {
    return `${num1} ${isNum1There}`;
};

const superHandler = throttle(add, {
    delay: 1000,
});

const a = superHandler(1, 2);
