function wait(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), milliseconds);
    });
}

function throttle(cb, opts) {
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
            clearTimeout(timeoutId);
            const now = performance.now();
            then = then || now;

            if (now - then > opts.delay) {
                update(now, ...args);
                console.log('per delay');
            }

            timeoutId = setTimeout(() => {
                update(now, ...args);
                console.log('timeout');
            }, opts.delay);

            return result;
        }

        const now = performance.now();

        if (!then) {
            console.log('first leading execution', 'timer started');

            update(now, ...args);

            return result;
        }

        if (now - then > opts.delay) {
            update(now, ...args);
            console.log('per leading delay');
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
