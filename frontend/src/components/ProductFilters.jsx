function ProductFilters({
  filters,
  categories,
  onFilterChange,
  onApply,
  onReset,
}) {
  return (
    <form className="filter-panel" onSubmit={onApply}>
      <div className="filter-grid">
        <input
          type="text"
          name="search"
          placeholder="Search products..."
          value={filters.search}
          onChange={onFilterChange}
        />
        <select
          name="categoryId"
          value={filters.categoryId}
          onChange={onFilterChange}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="minPrice"
          placeholder="Min price"
          value={filters.minPrice}
          onChange={onFilterChange}
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max price"
          value={filters.maxPrice}
          onChange={onFilterChange}
        />
      </div>
      <div className="filter-actions">
        <button type="submit" className="primary-button">
          Apply Filters
        </button>
        <button type="button" className="ghost-button" onClick={onReset}>
          Reset
        </button>
      </div>
    </form>
  );
}

export default ProductFilters;

