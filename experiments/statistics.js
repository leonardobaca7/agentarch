function quantile(values, probability) {
    if (!values.length || !values.every(Number.isFinite) || !Number.isFinite(probability) || probability < 0 || probability > 1) {
        throw new RangeError('Invalid quantile input');
    }
    const sorted = [...values].sort((a, b) => a - b);
    const position = (sorted.length - 1) * probability;
    const lower = Math.floor(position);
    const upper = Math.ceil(position);
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function describe(values) {
    if (values.length < 2 || !values.every(Number.isFinite)) throw new RangeError('At least two finite observations are required');
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const sd = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1));
    return { count: values.length, mean, sd, min: Math.min(...values), median: quantile(values, 0.5),
        p95: quantile(values, 0.95), p99: quantile(values, 0.99), max: Math.max(...values) };
}

module.exports = { quantile, describe };
