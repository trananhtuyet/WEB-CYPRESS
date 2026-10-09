import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "../../components/Icon";
import { getCategories } from "../../services/categoryService";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../../services/productService";
import { useToast } from "../../hooks/useToast";

const initialForm = {
  name: "",
  price: "",
  description: "",
  stock: "",
  category_id: "",
  image: null,
};

const productPageSize = 10;
const adminFetchPageSize = 100;

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const getBrand = (name = "") => {
  const knownBrands = ["Nike", "Adidas", "Uniqlo", "Zara", "H&M", "Dolia"];
  return knownBrands.find((brand) => name.toLowerCase().includes(brand.toLowerCase())) || "Dolia";
};

const getStatus = (stock) => {
  if (Number(stock) <= 0) return "Hết hàng";
  if (Number(stock) < 10) return "Nháp";
  return "Đang bán";
};

const getStatusClass = (status) => {
  if (status === "Hết hàng") return "out";
  if (status === "Nháp") return "draft";
  return "active";
};

function ProductManagement() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    brand: "",
    stock: "",
  });
  const [page, setPage] = useState(1);
  const searchKeyword = searchParams.get("search") || "";

  const fetchAllProducts = async () => {
    const firstPage = await getProducts({ page: 1, limit: adminFetchPageSize });
    const initialProducts = firstPage.products || [];
    const totalPages = firstPage.pagination?.totalPages || 1;

    if (totalPages <= 1) {
      return initialProducts;
    }

    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        getProducts({ page: index + 2, limit: adminFetchPageSize })
      )
    );

    return [
      ...initialProducts,
      ...remainingPages.flatMap((pageData) => pageData.products || []),
    ];
  };

  const loadData = async () => {
    const [categoryData, productData] = await Promise.all([
      getCategories(),
      fetchAllProducts(),
    ]);
    setCategories(categoryData);
    setProducts(productData);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setFilters((current) => (
      current.search === searchKeyword
        ? current
        : { ...current, search: searchKeyword }
    ));
  }, [searchKeyword]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const sku = `SP-${String(product.id).padStart(3, "0")}`;
      const brand = getBrand(product.name);
      const status = getStatus(product.stock);
      const searchText = [
        product.name,
        sku,
        product.category?.name,
        product.description,
        brand,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (filters.search && !searchText.includes(filters.search.toLowerCase())) return false;
      if (filters.category && product.category?.name !== filters.category) return false;
      if (filters.status && status !== filters.status) return false;
      if (filters.brand && brand !== filters.brand) return false;
      if (filters.stock === "low" && Number(product.stock) >= 10) return false;
      if (filters.stock === "available" && Number(product.stock) <= 0) return false;
      return true;
    });
  }, [filters, products]);

  const brands = useMemo(() => {
    return [...new Set(products.map((product) => getBrand(product.name)))];
  }, [products]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / productPageSize));
  const displayProducts = filteredProducts.slice((page - 1) * productPageSize, page * productPageSize);
  const productPageNumbers = Array.from({ length: Math.min(totalProductPages, 5) }, (_, index) => {
    const start = Math.min(Math.max(page - 2, 1), Math.max(totalProductPages - 4, 1));
    return start + index;
  }).filter((pageNumber) => pageNumber <= totalProductPages);

  const isAllSelected =
    displayProducts.length > 0 && displayProducts.every((product) => selectedIds.includes(product.id));

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setForm((current) => ({
      ...current,
      [name]: files ? files[0] : value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const openCreateForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const buildFormData = () => {
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        data.append(key, value);
      }
    });
    return data;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await updateProduct(editingId, buildFormData());
        showToast("Product updated");
      } else {
        await createProduct(buildFormData());
        showToast("Product created");
      }
      resetForm();
      await loadData();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to save product", "error");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
      stock: product.stock,
      category_id: product.category_id,
      image: null,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteProduct(id);
    showToast("Product deleted");
    setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
    await loadData();
  };

  const handleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : [...new Set([...selectedIds, ...displayProducts.map((product) => product.id)])]);
  };

  const handleSelectProduct = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]
    );
  };

  return (
    <section className="product-admin-page">
      <div className="product-admin-heading">
        <h1>Quản Lý Sản Phẩm</h1>
        <button type="button" className="product-admin-primary" onClick={openCreateForm}>
          + Thêm Sản Phẩm Mới
        </button>
      </div>

      <div className="product-admin-toolbar">
        <label className="product-admin-search">
          <input
            type="search"
            placeholder="Tìm theo tên, SKU, barcode..."
            value={filters.search}
            onChange={(event) => {
              const value = event.target.value;
              setFilters((current) => ({ ...current, search: value }));
              setSearchParams((current) => {
                const next = new URLSearchParams(current);
                if (value) {
                  next.set("search", value);
                } else {
                  next.delete("search");
                }
                return next;
              });
            }}
          />
          <span>⌕</span>
        </label>

        <select
          value={filters.category}
          onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
        >
          <option value="">Danh Mục</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
        >
          <option value="">Trạng Thái</option>
          <option value="Đang bán">Đang bán</option>
          <option value="Hết hàng">Hết hàng</option>
          <option value="Nháp">Nháp</option>
        </select>
        <select
          value={filters.brand}
          onChange={(event) => setFilters((current) => ({ ...current, brand: event.target.value }))}
        >
          <option value="">Thương Hiệu</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
        <select
          value={filters.stock}
          onChange={(event) => setFilters((current) => ({ ...current, stock: event.target.value }))}
        >
          <option value="">Kho</option>
          <option value="available">Còn hàng</option>
          <option value="low">Sắp hết</option>
        </select>
        <button type="button" className="product-admin-export">
          <Icon name="upload" /> Nhập/Xuất File
        </button>
      </div>

      <section className="product-admin-table-card">
        <div className="product-admin-table-title">Đã sản phẩm</div>
        <div className="product-admin-table-wrap">
          <table className="product-admin-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />
                </th>
                <th>Hình Ảnh</th>
                <th>Tên Sản Phẩm & SKU</th>
                <th>Danh Mục</th>
                <th>Thương Hiệu</th>
                <th>Giá Bán</th>
                <th>Tồn Kho</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {displayProducts.map((product) => {
                const status = getStatus(product.stock);
                return (
                  <tr key={product.id} className={selectedIds.includes(product.id) ? "selected" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                      />
                    </td>
                    <td>
                      <img
                        src={
                          product.image ||
                          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=140&q=80"
                        }
                        alt={product.name}
                        className="product-admin-thumb"
                      />
                    </td>
                    <td>
                      <strong>{product.name}</strong>
                      <span>SP-{String(product.id).padStart(3, "0")}</span>
                    </td>
                    <td>{product.category?.name || "-"}</td>
                    <td>{getBrand(product.name)}</td>
                    <td>{formatCurrency(Number(product.price))}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`product-admin-status ${getStatusClass(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <div className="product-admin-actions">
                        <button type="button" title="Xem">
                          <Icon name="eye" />
                        </button>
                        <button type="button" title="Sửa" onClick={() => handleEdit(product)}>
                          <Icon name="edit" />
                        </button>
                        <button type="button" title="Nhân bản">
                          <Icon name="duplicate" />
                        </button>
                        <button type="button" title="Xóa" onClick={() => handleDelete(product.id)}>
                          <Icon name="delete" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="product-admin-footer">
          <span>Đã chọn: {selectedIds.length} sản phẩm</span>
          <select defaultValue="">
            <option value="">Hành Động Hàng Loạt</option>
            <option value="pause">Ngừng bán</option>
            <option value="delete">Xóa</option>
          </select>
          <button type="button">Ngừng bán</button>
          <button type="button">Xóa</button>
          <button type="button">Cập nhật danh mục</button>
          <span className="product-admin-page-count">Trang {page}/{totalProductPages}</span>
          <button type="button" onClick={() => setPage((current) => Math.max(current - 1, 1))} disabled={page <= 1}>
            ‹ Pre
          </button>
          {productPageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={pageNumber === page ? "active" : ""}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(current + 1, totalProductPages))}
            disabled={page >= totalProductPages}
          >
            Next ›
          </button>
        </div>
      </section>

      {isFormOpen && (
        <div className="product-admin-drawer" role="dialog" aria-modal="true">
          <form className="product-admin-form" onSubmit={handleSubmit}>
            <div className="product-admin-form-head">
              <h2>{editingId ? "Cập Nhật Sản Phẩm" : "Thêm Sản Phẩm Mới"}</h2>
              <button type="button" onClick={resetForm}>
                ×
              </button>
            </div>

            <label>
              Tên sản phẩm
              <input name="name" placeholder="Áo sơ mi nam..." value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Giá bán
              <input
                name="price"
                type="number"
                step="0.01"
                placeholder="1250000"
                value={form.price}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Mô tả
              <textarea
                name="description"
                placeholder="Mô tả chất liệu, form dáng, màu sắc..."
                value={form.description}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Tồn kho
              <input
                name="stock"
                type="number"
                placeholder="150"
                value={form.stock}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Danh mục
              <select name="category_id" value={form.category_id} onChange={handleChange} required>
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Hình ảnh
              <input name="image" type="file" accept="image/*" onChange={handleChange} />
            </label>

            <div className="product-admin-form-actions">
              <button type="button" onClick={resetForm}>
                Hủy
              </button>
              <button type="submit">{editingId ? "Cập Nhật" : "Thêm Sản Phẩm"}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default ProductManagement;
