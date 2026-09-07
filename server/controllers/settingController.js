// =========================
// STORE SETTINGS CONTROLLER
// =========================

const Setting = require("../models/Setting");

const { SETTINGS_KEY } = Setting;

// -------------------------
// GET /api/settings
// -------------------------

const getSettings = async (request, response) => {
  const settings = await Setting.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $setOnInsert: { key: SETTINGS_KEY } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  response.json(settings);
};

// -------------------------
// PUT /api/settings
// -------------------------

const updateSettings = async (request, response) => {
  const body = request.body || {};

  const update = {};

  if (body.storeName !== undefined) {
    update.storeName = String(body.storeName).trim();
  }

  if (body.storeAddress !== undefined) {
    update.storeAddress = String(body.storeAddress).trim();
  }

  if (body.storePhone !== undefined) {
    update.storePhone = String(body.storePhone).trim();
  }

  if (body.receiptFooter !== undefined) {
    update.receiptFooter = String(body.receiptFooter).trim();
  }

  if (body.lowStockAlert !== undefined) {
    update.lowStockAlert = Number(body.lowStockAlert);
  }

  if (body.darkMode !== undefined) {
    update.darkMode = Boolean(body.darkMode);
  }

  if (update.storeName === "") {
    return response.status(400).json({ message: "Store name is required." });
  }

  const settings = await Setting.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $set: update },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  );

  response.json(settings);
};

module.exports = { getSettings, updateSettings };
