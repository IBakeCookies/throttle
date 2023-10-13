interface Config {
    delay: number;
    isLeading?: boolean;
    onError?: (error: Error) => void;
}

type Handler<I extends (...args: any) => any> = (...args: Parameters<I>) => ReturnType<I>;

type ThrottleHandlerReturn<I extends Handler<I>, C extends Config> = C['isLeading'] extends true
    ? ReturnType<I>
    : ReturnType<I> | void;

export function throttle<I extends Handler<I>, C extends Config>(
    handler: I,
    config: C,
): {
    cancel: () => void;
    invoke: (...args: Parameters<I>) => ThrottleHandlerReturn<I, C>;
} & ((...args: Parameters<I>) => ThrottleHandlerReturn<I, C>) {
    let timeoutId: ReturnType<typeof setTimeout>;
    let isThrotteled = false;
    let result: ThrottleHandlerReturn<I, C>;
    let lastArgs: Parameters<I>;

    const { delay = 0, isLeading = false } = config;

    function invoke(...args: Parameters<I>): ThrottleHandlerReturn<I, C> {
        try {
            result = handler.apply(this, args);
        } catch (error) {
            if (config.onError) {
                config.onError(error);
            }
        } finally {
            return result;
        }
    }

    function cancel() {
        clearTimeout(timeoutId);
        isThrotteled = false;
    }

    _throttle.cancel = cancel;
    _throttle.invoke = invoke;

    function _throttle(...args: Parameters<I>): ThrottleHandlerReturn<I, C> {
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

    return _throttle;
}
