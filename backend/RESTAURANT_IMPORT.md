# Nearby restaurant and menu import

The importer discovers nearby restaurants from OpenStreetMap, stores the
OpenStreetMap record ID and attribution, and assigns imported stores to the
configured Atlas admin account.

It deliberately does not scrape Google, Zomato, Swiggy, or restaurant pages.
Full menu items and restaurant-funded offers are imported only from an HTTPS
JSON feed that explicitly contains `"authorized": true`.

## Configuration

Set these backend environment variables:

- `IMPORT_LATITUDE` and `IMPORT_LONGITUDE` (required for CLI/cron)
- `IMPORT_RADIUS_METERS` (optional, 100-25000; default 5000)
- `IMPORT_MAX_RESTAURANTS` (optional, 1-200; default 50)
- `MERCHANT_MENU_FEED_URL` (optional HTTPS partner feed)
- `CRON_SECRET` (required only for the scheduled endpoint)
- existing `MONGO_URI` and `ADMIN_EMAIL`

Preview without database writes:

```bash
npm run import:restaurants -- --dry-run
```

Run the import:

```bash
npm run import:restaurants
```

Atlas can also call `POST /api/import/restaurants` with a normal admin JWT and
this body:

```json
{
  "latitude": 26.4499,
  "longitude": 80.3319,
  "radius": 5000,
  "maxRestaurants": 50,
  "dryRun": false
}
```

A scheduler can call `GET /api/import/restaurants/cron` with
`Authorization: Bearer <CRON_SECRET>`. Vercel Cron automatically uses that
header when `CRON_SECRET` is configured.

## Menu feed

Use `data/merchant-menus.example.json` as the contract. A restaurant entry is
matched with its OpenStreetMap ID (for example `node/123`). Menu items are
upserted by `externalId`. Coupons support:

- `percentage`, optionally limited to selected menu item IDs
- `fixed_amount`, optionally limited to selected menu item IDs
- `free_delivery`, with an optional minimum order amount

Coupon eligibility and final order totals are recalculated on the backend at
checkout. The browser cannot choose its own discount amount.

OpenStreetMap data is credited as © OpenStreetMap contributors and is available
under the ODbL: https://www.openstreetmap.org/copyright
