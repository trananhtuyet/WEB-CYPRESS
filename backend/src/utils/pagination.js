const getPagination = ({ page = 1, limit = 8 }) => {
  const parsedPage = Math.max(Number(page) || 1, 1);
  const parsedLimit = Math.max(Number(limit) || 8, 1);

  return {
    limit: parsedLimit,
    offset: (parsedPage - 1) * parsedLimit,
    page: parsedPage,
  };
};

module.exports = {
  getPagination,
};

