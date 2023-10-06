interface Config {
    delay: number;
    isLeading?: boolean;
    onError?: (error: Error) => void;
}

type Invoker<I extends (...args: Parameters<I>) => ReturnType<I> | void> = (
    ...args: Parameters<I>
) => ReturnType<I> | void;

type Throttle<I extends (...args: Parameters<I>) => ReturnType<I> | void> = Invoker<I> & {
    cancel: () => void;
    invoke: Invoker<I>;
};

export function throttle<I extends (...args: Parameters<I>) => ReturnType<I>>(
    handler: I,
    config: Config,
): Throttle<I> {
    let timeoutId: ReturnType<typeof setTimeout>;
    let isThrotteled = false;
    let result: ReturnType<I> | void;
    let lastArgs: Parameters<I>;

    const { delay = 0, isLeading = false } = config;

    function _throttle(...args: Parameters<I>) {
        if (isLeading) {
            if (isThrotteled) {
                return result;
            }

            isThrotteled = true;

            invoke.apply(this, args);

            setTimeout(() => {
                isThrotteled = false;
            }, delay);

            return result;
        }

        if (!timeoutId) {
            timeoutId = setTimeout(() => {
                invoke.apply(this, lastArgs);

                timeoutId = null;
            }, delay);

            return result;
        }

        lastArgs = args;

        return result;
    }

    function invoke(...args: Parameters<I>) {
        try {
            result = handler.bind(this)(...args);
        } catch (error) {
            if (config.onError) {
                config.onError(error);
            }
        } finally {
            return result;
        }
    }

    _throttle.cancel = () => {
        clearTimeout(timeoutId);
        isThrotteled = false;
    };

    _throttle.invoke = invoke;

    return _throttle;
}
