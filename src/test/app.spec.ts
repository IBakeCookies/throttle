import { jest, describe, expect, test } from '@jest/globals';
import { throttle } from '../throttle';

const add = (num1: number, num2: number): number => {
    return num1 + num2;
};

describe('Throttle', () => {
    jest.useFakeTimers();

    test('The function gets called only once per delay', () => {
        const f = jest.fn();

        const superHandler = throttle(f, {
            delay: 1000,
        });

        for (let i = 0; i < 100000; i++) {
            superHandler();
        }

        jest.runAllTimers();

        expect(f).toHaveBeenCalledTimes(1);
    });

    test('The function gets called only once per delay in leading mode', () => {
        const f = jest.fn();

        const superHandler = throttle(f, {
            delay: 1000,
            isLeading: true,
        });

        for (let i = 0; i < 100000; i++) {
            superHandler();
        }

        jest.runAllTimers();

        expect(f).toHaveBeenCalledTimes(1);
    });

    test('The function returns the previous value in tailing mode', async () => {
        let output;
        const superHandler = throttle(add, {
            delay: 1000,
        });

        output = superHandler(1, 1);

        expect(output).toBe(undefined);

        jest.runAllTimers();

        output = superHandler(2, 2);

        expect(output).toBe(2);

        output = superHandler(3, 3);

        expect(output).toBe(2);

        jest.runAllTimers();

        output = superHandler(4, 4);

        expect(output).toBe(4);

        jest.runAllTimers();

        output = superHandler(5, 5);

        expect(output).toBe(8);
    });

    test('The function returns the previous / current value in leading mode', () => {
        let output;

        const superHandler = throttle(add, {
            delay: 1000,
            isLeading: true,
        });

        output = superHandler(1, 1);

        expect(output).toBe(2);

        output = superHandler(2, 2);

        expect(output).toBe(2);

        jest.runAllTimers();

        output = superHandler(3, 3);

        expect(output).toBe(6);
    });

    test('can be invoked regardless of the delay in trailing mode', () => {
        let output;

        const superHandler = throttle(add, {
            delay: 1000,
        });

        output = superHandler.invoke(1, 1);

        jest.runAllTimers();

        expect(output).toBe(2);
    });

    test('can be invoked regardless of the delay in leading mode', () => {
        let output;

        const superHandler = throttle(add, {
            delay: 1000,
            isLeading: true,
        });

        output = superHandler.invoke(1, 1);

        jest.runAllTimers();

        expect(output).toBe(2);
    });

    test('the delay can be canceled', () => {
        let output;

        const superHandler = throttle(add, {
            delay: 1000,
        });

        output = superHandler(1, 1);

        superHandler.cancel();

        jest.runAllTimers();

        output = superHandler(2, 2);

        expect(output).toBe(undefined);
    });

    test('can catch errors', async () => {
        // const superHandler = throttle(getError, {
        //     delay: 1000,
        //     onError: (error) => {
        //         throw error;
        //     },
        // });
        // superHandler();
        // expect(superHandler).toThrow('Error');
    });
});
