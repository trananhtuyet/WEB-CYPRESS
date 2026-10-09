function Pagination({ pagination, onPageChange }) {
  const pages = Array.from({ length: pagination.totalPages }, (_, index) => index + 1);

  return (
    <div className="pagination">
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={page === pagination.page ? "page-button active" : "page-button"}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
    </div>
  );
}

export default Pagination;

