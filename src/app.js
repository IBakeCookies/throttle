function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), milliseconds);
  });
}

function throttle(cb, opts) {
  let timeoutId = null;
  let then = 0;

  function _throttle(...args) {
    const now = performance.now();

    then = then || now;

    clearTimeout(timeoutId);

    if (now - then > opts.delay) {
      then = now;

      console.log("then");

      return new Promise((resolve) => {
        resolve(cb(...args));
      });
    }

    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        then = now;

        console.log("timeout");
        resolve(cb(...args));
      }, opts.delay);
    });
  }

  _throttle.cancel = () => {
    clearTimeout(timeoutId);
  };

  return _throttle;
}

const add = (num1, num2) => {
  return num1 + num2;
};

const superHandler = throttle(add, {
  delay: 1000,
  //   isLeading: true,
  //   onError: (error) => {
  //     console.log(error);
  //   },
});

// setTimeout(() => {
//   setInterval(() => {
//     superHandler(2, 5);
//   }, 900);
// }, 1000);

superHandler(2, 5);

// async function wrapper() {
//   let output;

//   output = superHandler(1, 1);
//   await wait(100);
//   output = superHandler(2, 2);
//   await wait(100);
//   output = superHandler(3, 3);
//   await wait(100);
//   output = superHandler(4, 4);

//   await wait(1000);

//   console.log(output);

//   output = superHandler(5, 5);
//   console.log("5,5", output);

//   await wait(100);
//   output = superHandler(6, 6);
//   await wait(100);
//   output = superHandler(7, 7);
//   await wait(1000);

//   console.log(output);
// }

// wrapper();

// setInterval(() => {
//   superHandler(2, 5);
// }, 50);

// setTimeout(() => {
//   superHandler(2, 5);
// }, 500);

// setTimeout(() => {
//   superHandler.cancel();
// }, 900);
