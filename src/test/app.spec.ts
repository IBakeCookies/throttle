import { jest, describe, expect, test } from '@jest/globals';
import { throttle, wait } from '../throttle';

jest.useFakeTimers();

const add = (num1: number, num2: number): number => {
    return num1 + num2;
};

describe('Throttle', () => {
    test('The function gets called only once per delay', () => {
        const superHandler = throttle(add, {
            delay: 1000,
        });

        for (let i = 0; i < 1000; i++) {
            superHandler(1, 1);
        }

        expect(superHandler).toHaveBeenCalledTimes(1);
    });

    test('It can be canceled', () => {
        const superHandler = throttle(add, {
            delay: 1000,
        });

        superHandler(1, 1);
        superHandler(2, 2);

        superHandler.cancel();

        expect(superHandler).toHaveBeenCalledTimes(0);
    });

    test('It returns a cached value', async () => {
        let output = null;

        const superHandler = throttle(add, {
            delay: 100,
        });

        output = superHandler(1, 1);

        expect(output).toBe(null);

        output = superHandler(2, 2);
        output = superHandler(3, 3);
        output = superHandler(4, 4);

        await wait(1000);

        jest.runAllTimers();

        expect(superHandler()).toHaveBeenCalledTimes(1);

        expect(output).toBe(8);
    });

    test('It can run in leading mode', async () => {
        let output = null;

        const superHandler = throttle(add, {
            delay: 100,
            isLeading: true,
        });

        output = superHandler(1, 1);

        expect(output).toBe(2);

        output = superHandler(2, 2);

        expect(output).toBe(2);

        output = superHandler(3, 3);

        expect(output).toBe(2);

        output = superHandler(4, 4);

        await wait(1000);

        jest.runAllTimers();

        expect(output).toBe(8);

        expect(superHandler()).toHaveBeenCalledTimes(1);
    });

    test('It can handle errors', async () => {});
});
