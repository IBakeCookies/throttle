import { jest, describe, expect, test, beforeEach } from '@jest/globals';
import { throttle } from '../throttle';
import { wait } from '../wait';

const heavyLoadCallsCount = 100000;
let fn;

function createObj() {
    return {
        fn: jest.fn((a) => a),

        // this handler preserved the scope
        scopedHandler: throttle(
            function (a) {
                return this.fn(a);
            },
            { delay: 30 },
        ),
    };
}

function createFaultyObj(done) {
    return {
        fn: jest.fn((a) => a),

        // this handler does not preserve the scope (anon function)
        wrongHandler: throttle((a) => this.fn(a), {
            delay: 30,
            onError: (error) => {
                expect(error).toBeInstanceOf(Error);
                done();
            },
        }),
    };
}

beforeEach(() => {
    fn = jest.fn((a) => a);
});

describe('throttle()', () => {
    test('throttle invoke last event only', async () => {
        const throttleFn = throttle(fn, { delay: 30 });

        throttleFn(1);
        throttleFn(2);
        throttleFn(3);
        throttleFn(4);
        expect(fn).toHaveBeenCalledTimes(0);
        await wait(35);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveReturnedWith(4);
        throttleFn(5);
        await wait(20);
        throttleFn(6);
        await wait(20);
        throttleFn(7);
        await wait(20);
        throttleFn(8);
        await wait(20);
        expect(fn).toHaveBeenCalledTimes(3);
        expect(fn).toHaveReturnedWith(8);
    });

    test('throttle returns undefined until next execution', async () => {
        const throttleFn = throttle(fn, { delay: 30 });
        let result;

        result = throttleFn(1);
        result = throttleFn(2);
        result = throttleFn(3);
        result = throttleFn(4);

        expect(fn).toHaveBeenCalledTimes(0);
        expect(result).toBe(undefined);

        await wait(35);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(result).toBe(undefined);

        result = throttleFn(5);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(result).toBe(4);
    });

    test('isLeading throttle invoke first event only', async () => {
        const throttleFn = throttle(fn, { delay: 30, isLeading: true });

        throttleFn(1);
        throttleFn(2);
        throttleFn(3);
        throttleFn(4);
        expect(fn).toHaveBeenCalledTimes(1);
        await wait(35);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveReturnedWith(1);
        throttleFn(5);
        await wait(20);
        throttleFn(6);
        await wait(20);
        throttleFn(7);
        await wait(20);
        throttleFn(8);
        await wait(20);
        expect(fn).toHaveBeenCalledTimes(3);
        expect(fn).toHaveReturnedWith(7);
    });

    test('isLeading throttle returns the value from first execution', async () => {
        const throttleFn = throttle(fn, { delay: 30, isLeading: true });
        let result;

        result = throttleFn(1);
        result = throttleFn(2);
        result = throttleFn(3);
        result = throttleFn(4);

        expect(fn).toHaveBeenCalledTimes(1);
        expect(result).toBe(1);

        await wait(35);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(result).toBe(1);

        result = throttleFn(5);
        expect(fn).toHaveBeenCalledTimes(2);
        expect(result).toBe(5);
    });

    test('throttle invoked once on 100k events', async () => {
        const throttleFn = throttle(fn, { delay: 50 });

        for (let i = 0; i < heavyLoadCallsCount; i++) {
            throttleFn(i);
        }

        expect(fn).toHaveBeenCalledTimes(0);
        await wait(55);

        for (let i = 0; i < heavyLoadCallsCount; i++) {
            throttleFn(i);
        }

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveReturnedWith(heavyLoadCallsCount - 1);
    });

    test('isLeading throttle invoked once on 100k events', async () => {
        const throttleFn = throttle(fn, { delay: 50, isLeading: true });

        for (let i = 0; i < heavyLoadCallsCount; i++) {
            throttleFn(i);
        }

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveReturnedWith(0);
    });

    test('throttle preserves the scope', async () => {
        const obj = createObj();
        let result;

        result = obj.scopedHandler(1);
        result = obj.scopedHandler(2);
        result = obj.scopedHandler(3);
        result = obj.scopedHandler(4);

        expect(obj.fn).toHaveBeenCalledTimes(0);
        expect(result).toBe(undefined);

        await wait(35);
        expect(obj.fn).toHaveBeenCalledTimes(1);
        expect(result).toBe(undefined);

        result = obj.scopedHandler(5);
        expect(obj.fn).toHaveBeenCalledTimes(1);
        expect(result).toBe(4);
    });

    test('call onError when handler fails', (done) => {
        const failingIndex = Math.random() * heavyLoadCallsCount;
        const throttleFn = throttle(
            (i) => {
                if (i >= failingIndex) {
                    throw new Error();
                }
            },
            {
                delay: 50,
                onError: (error) => {
                    expect(error).toBeInstanceOf(Error);
                    done();
                },
            },
        );

        for (let i = 0; i < heavyLoadCallsCount; i++) {
            throttleFn(i);
        }
    });

    test('call onError when handler scope fails', (done) => {
        let result,
            faultyObj = createFaultyObj(done);

        result = faultyObj.wrongHandler(1);
        result = faultyObj.wrongHandler(2);

        expect(faultyObj.fn).toHaveBeenCalledTimes(0);
        expect(result).toBe(undefined);
    });
});
