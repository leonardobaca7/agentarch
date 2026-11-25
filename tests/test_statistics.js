const assert = require('node:assert/strict');
const { quantile, describe } = require('../experiments/statistics');

assert.equal(quantile([4, 0, 3, 1, 2], 0), 0);
assert.equal(quantile([4, 0, 3, 1, 2], 1), 4);
assert.equal(quantile([4, 0, 3, 1, 2], 0.5), 2);
assert.equal(quantile([0, 1, 2, 3, 4], 0.95), 3.8);
assert.equal(quantile([0, 1, 2, 3, 4], 0.99), 3.96);
assert.equal(describe([1, 2, 3]).sd, 1);
assert.throws(() => describe([1]), RangeError);
assert.throws(() => quantile([1, 2], NaN), RangeError);
console.log('Quantile interpolation and sample standard deviation verified.');
