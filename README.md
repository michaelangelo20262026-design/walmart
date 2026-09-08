# Favour Store POS

Point of sale for a small store: barcode scanning, cart, receipts, inventory
and sales history. The browser front end is plain HTML, CSS and JavaScript;
the backend is Express with Mongoose on MongoDB.

## Folder layout

```
.
├── public/               Front end served as static files
│   ├── index.html        Landing page
│   ├── pos.html          The POS itself
│   ├── api.js            Client for the backend
│   ├── script.js         POS logic
│   ├── landing.css, style.css
│   └── assets/           Images
├── server/
│   ├── index.js          Express app and start-up
│   ├── config/
│   │   ├── db.js         MongoDB connection
│   │   └── seed.js       Default products for an empty database
│   ├── models/           Product, Sale, Setting (Mongoose schemas)
│   ├── controllers/      Request handling
│   ├── routes/           API routing
│   └── middleware/       Async wrapper, database guard, error handling
├── .env                  Local configuration (not committed)
└── .env.example          Template for .env
```

## Running it

```bash
npm install
cp .env.example .env      # then set MONGODB_URI
npm start                 # or: npm run dev  (restarts on file changes)
```

Then open <http://localhost:3000>. `MONGODB_URI` accepts a local MongoDB
(`mongodb://127.0.0.1:27017/favour-store`) or an Atlas connection string.

The first start against an empty database inserts six sample products. Set
`SEED_DEFAULT_PRODUCTS=false` in `.env` to skip that.

## API

All responses are JSON. Ids are MongoDB ids returned as `id`.

| Method   | Route                | Purpose                                          |
| -------- | -------------------- | ------------------------------------------------ |
| `GET`    | `/api/health`        | Server and database status                       |
| `GET`    | `/api/products`      | List products                                    |
| `POST`   | `/api/products`      | Add a product                                    |
| `PUT`    | `/api/products/:id`  | Update a product                                 |
| `DELETE` | `/api/products/:id`  | Delete a product                                 |
| `GET`    | `/api/sales`         | List sales, oldest first (`?limit=` to cap)      |
| `POST`   | `/api/sales`         | Record a sale and reduce stock                   |
| `DELETE` | `/api/sales`         | Clear sales history                              |
| `GET`    | `/api/settings`      | Store settings                                   |
| `PUT`    | `/api/settings`      | Update store settings                            |

Two rules live on the server rather than in the browser:

- **Sale totals are recomputed** from the submitted items, and **stock is
  reduced** by the server, never below zero. Items whose id is not a product id
  (manual items) are recorded without touching inventory.
- **Barcodes are unique** when present, enforced both by a check in the
  controller and by a unique partial index. Any number of products may have no
  barcode.

## Offline behaviour

The POS keeps a copy of products, sales and settings in `localStorage`. On
start-up it calls `/api/health`; when the API answers it replaces that copy with
the server's data, and every change is sent to the server as it happens.

When the server or the database is unreachable, the page still opens, still
sells and still prints receipts, saving to that local copy and showing an
"Offline mode" notice. Those offline sales stay on the device — the next
successful load takes the server's data as the source of truth.

## Moving products from an older, browser-only version

Before the backend existed, products lived in the browser's `localStorage`,
which is tied to the exact address the page was opened from. Data saved under
`file://` or a Live Server port is not visible at `http://localhost:3000`, so
the store can look empty and scanning a real product reports "Product not
found".

To bring that inventory across:

1. Open the POS the old way, the address you used before.
2. **Settings → Data Management → Backup Data**, which downloads a JSON file.
3. Open the POS at its new address and choose **Restore Products**, then pick
   that file.

Restore adds only products the store does not have yet — matched on barcode, or
on name when there is no barcode. Sales history and settings are left as they
are.

## Notes

- The barcode scanner library is served from the project's own dependencies at
  `/vendor/zxing`, so scanning works without internet access.
- `npm run dev` uses `node --watch`; there is no build step and no framework on
  either side.
- A handheld (keyboard-wedge) scanner types into the barcode box and usually
  sends Enter, which submits the scan straight away. Without Enter the code is
  submitted once typing stops; a code that is still the beginning of a barcode
  the store knows is given longer to finish arriving.
