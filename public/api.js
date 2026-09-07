(function () {
  const API_BASE = "/api";

  const request = async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    const text = await response.text();

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      const message =
        (data && data.message) || `Request failed (${response.status}).`;

      const error = new Error(message);

      error.status = response.status;

      throw error;
    }

    return data;
  };

  const StoreAPI = {
    // Set by checkConnection(); the POS reads it before every write.
    online: false,

    // Why the last connection check failed, for the offline notice.
    reason: "",

    // -------------------------
    // CONNECTION
    // -------------------------

    checkConnection: async () => {
      try {
        const health = await request("/health");

        StoreAPI.online = health.database === "connected";

        // Tells the POS whether the server or only the database is missing.
        StoreAPI.reason = StoreAPI.online ? "" : "database offline";
      } catch (error) {
        StoreAPI.online = false;

        StoreAPI.reason = "server unreachable";
      }

      return StoreAPI.online;
    },

    // -------------------------
    // PRODUCTS
    // -------------------------

    products: {
      list: () => request("/products"),

      create: (product) =>
        request("/products", {
          method: "POST",
          body: JSON.stringify(product),
        }),

      update: (id, product) =>
        request(`/products/${id}`, {
          method: "PUT",
          body: JSON.stringify(product),
        }),

      remove: (id) => request(`/products/${id}`, { method: "DELETE" }),
    },

    // -------------------------
    // SALES
    // -------------------------

    sales: {
      list: () => request("/sales"),

      create: (sale) =>
        request("/sales", {
          method: "POST",
          body: JSON.stringify(sale),
        }),

      clear: () => request("/sales", { method: "DELETE" }),
    },

    // -------------------------
    // STORE SETTINGS
    // -------------------------

    settings: {
      get: () => request("/settings"),

      update: (settings) =>
        request("/settings", {
          method: "PUT",
          body: JSON.stringify(settings),
        }),
    },
  };

  window.StoreAPI = StoreAPI;
})();
