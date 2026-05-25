export const buildDateRange = (start?: Date, end?: Date) => {
  if (!start && !end) {
    return undefined;
  }

  return {
    ...(start && {
      gte: new Date(new Date(start).setHours(0, 0, 0, 0)),
    }),
    ...(end && {
      lte: new Date(new Date(end).setHours(23, 59, 59, 999)),
    }),
  };
};
