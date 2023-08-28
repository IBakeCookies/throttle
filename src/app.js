function wait(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), milliseconds);
    });
}

function throttle(handler, opts) {
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
    };

    _throttle.invoke = (...args) => invoke(...args);

    return _throttle;
}

const add = (num1, num2) => {
    return num1 + num2;
};

// const handler = throttle(add, {
//     delay: 1000,
//     isLeading: true,
// });

// let output;

// output = handler(1, 2);

// console.log(output);

// output = handler(1, 2);

// console.log(output); // 3

// wait(1500);

// output = handler(1, 2);

// console.log(output); // 3

// setInterval(() => {
//     output = handler(1, 1);

//     console.log(output);
// }, 100);
