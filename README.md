# CC_BackProj-3

**E-commerce / inventory backend**
Features: CSV inventory upload, Google OAuth user signup, admin login (JWT), cart & orders endpoint.

---

## Tech stack

- Node.js (ES Modules)
- Express
- Sequelize (SQLite dialect)
- Passport (Google OAuth)
- Multer + csv-parser
- JWT for auth

---

## What it does

- Manage inventory (create, update, delete, list)
- Upload inventory via CSV (bulk insert)
- Simple shop endpoints (list items with pagination & search)
- Cart operations and order placement
- Admin login (username/password → JWT)
- Google OAuth signup/login for users
- Revenue calculation endpoint

---

## Install & run

1. Extract repo / `cd` into project root.
2. Install dependencies:

```
npm install
```

3. Create a `.env` file.
4. Start in dev mode:

```
npm run dev
```

---

## Environment variables

Create a `.env` file in the project root with at least:

```
PORT=3000
DB_PATH=./database.sqlite
JWT_SECRET=your_jwt_secret
ADMIN_USERNAME=admin@example.com
ADMIN_PASSWORD=someStrongPassword

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

---

## Seed admin user

To create/reset the DB and seed an admin (using the `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `.env`):

```
node src/seed.js
```

---

## API Endpoints (overview)

To view the endpoint documentation visit [Postman API Documentation](https://tanish-sde-542764.postman.co/workspace/Tanish-Soni's-Workspace~6a9195ae-945f-48d7-8167-a19cd39022da/collection/48428849-7950c1e6-80b6-4336-af2d-5dfa99a8603a?action=share&creator=48428849&active-environment=48428849-5670d21a-b702-4110-bed8-9627df3e85a4)

### Auth
- `POST /auth/user/signup` — create user `{ username, password }`
- `POST /auth/user/login` — login user, returns JWT
- `POST /auth/admin/login` — admin login, returns JWT
- `GET /auth/google` — start Google OAuth
- `GET /auth/google/callback` — Google OAuth callback, returns JWT

### Inventory (admin only)
- `POST /inventory/upload` — upload CSV (file field name `file`)
- `POST /inventory/new` — add single item
- `PUT /inventory/update/:id` — update item
- `DELETE /inventory/restock/:id` — restock item 
- `GET /inventory/list` — list all items
- `GET /inventory/revenue` — total revenue from orders
- `GET /inventory/orders` — see the user orders

> Admin-protected routes require:
> `Authorization: Bearer <JWT>`

### Shop / Public
- `GET /shop/list` — paginated listing with search/page query params

### Cart & Orders (user)
- `POST /cart/add` — add item to cart
- `POST /cart/remove` — remove item to cart
- `GET /cart/info` — view cart
- `POST /cart/checkout` — make an order from the cart
- `POST /orders/create` — create order
- `GET /orders/past` — list user past orders

---

## CSV Upload format

When uploading CSV (`/inventory/upload`), expected headers:

```
name,description,category,quantity,price,imageUrl
```

Example:

```
"Fancy Jacket","Warm winter jacket","Apparel",10,79.99,"http://example.com/img.jpg"
```

A sample CSV file exists in `uploads/samplefile.csv`.

---

## Example requests

Seed DB:

```
node src/seed.js
```

Admin login:

```
curl -X POST http://localhost:3000/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"username/email","password":"password"}'
```

