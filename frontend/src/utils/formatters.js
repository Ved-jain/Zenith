const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(value));

export const formatPercent = (value, options = {}) => {
  const number = toNumber(value);
  const sign = options.showSign === false || number < 0 ? "" : "+";

  return `${sign}${number.toFixed(2)}%`;
};

export const formatCompactNumber = (value) => {
  const number = toNumber(value);
  const absolute = Math.abs(number);
  const sign = number < 0 ? "-" : "";

  if (absolute >= 10000000) {
    return `${sign}${(absolute / 10000000).toFixed(2)}Cr`;
  }

  if (absolute >= 100000) {
    return `${sign}${(absolute / 100000).toFixed(2)}L`;
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(number);
};

export const formatVolume = (value) => formatCompactNumber(value);

export const formatDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};
