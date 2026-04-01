const naturalNameCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

const normalizeText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

export const compareNaturalText = (left, right) =>
  naturalNameCollator.compare(normalizeText(left), normalizeText(right));

export const sortByNaturalName = (items, getName = (item) => item) =>
  [...(Array.isArray(items) ? items : [])].sort((left, right) => {
    const primary = compareNaturalText(getName(left), getName(right));
    if (primary !== 0) {
      return primary;
    }

    return compareNaturalText(
      left?.userName ?? left?.email ?? left?.id,
      right?.userName ?? right?.email ?? right?.id,
    );
  });
