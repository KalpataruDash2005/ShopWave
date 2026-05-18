# ShopWave — E-Commerce Platform

A full-stack e-commerce web application built with a **Spring Boot** backend and a **JS / HTML / CSS** frontend.

---

## 📁 Project Structure

```
new_eom/
├── ECommerceFrontend/          # Frontend (HTML, CSS, JS)
│   ├── css/
│   │   ├── styles.css          # Storefront styles
│   │   └── admin.css           # Admin dashboard styles
│   ├── js/
│   │   ├── script.js           # Storefront logic (products, cart, orders)
│   │   └── admin.js            # Admin panel logic (CRUD, uploads)
│   ├── assets/
│   │   └── logo.png
│   ├── index.html              # Main landing / product listing page
│   ├── admin.html              # Admin dashboard
│   ├── cart.html               # Shopping cart page
│   └── order-success.html      # Post-purchase confirmation page
│
└── NewBE/                      # Backend (Spring Boot + MySQL)
    ├── src/
    │   └── main/
    │       ├── java/pro2/mini/
    │       │   ├── MiniApplication.java          # Spring Boot entry point
    │       │   ├── config/
    │       │   │   └── WebConfig.java            # CORS + static resource config
    │       │   ├── Controller/
    │       │   │   ├── CartController.java        # Cart REST endpoints
    │       │   │   ├── OrderController.java       # Order REST endpoints
    │       │   │   ├── ProductController.java     # Product CRUD endpoints
    │       │   │   └── FileUploadController.java  # Image upload endpoint
    │       │   ├── Model/
    │       │   │   ├── Cart.java
    │       │   │   ├── Product.java
    │       │   │   ├── Order.java
    │       │   │   └── OrderItem.java
    │       │   ├── Repository/
    │       │   │   ├── CartRepository.java
    │       │   │   ├── ProductRepository.java
    │       │   │   ├── OrderRepository.java
    │       │   │   └── OrderItemRepository.java
    │       │   └── Services/
    │       │       ├── CartService.java
    │       │       ├── OrderService.java
    │       │       └── ProductService.java
    │       └── resources/
    │           └── application.properties        # DB + server configuration
    └── pom.xml                                   # Maven dependencies
```

---

## 🛠️ Technology Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript (ES6+)      |
| Backend    | Java 21, Spring Boot, Spring MVC, Spring JPA|
| Database   | MySQL                                       |
| Build Tool | Maven                                       |
| ORM        | Hibernate (via Spring Data JPA)             |
| Utilities  | Lombok                                      |

---

## ✨ Features

### Storefront (`index.html`)
- Dynamic product grid fetched live from the backend API
- Real-time search bar with debounced filtering
- Category chip filters (Electronics, Fashion, Home & Living, etc.)
- Skeleton loaders while products are fetching
- Add to cart with toast notifications and cart badge updates
- Wishlist toggle on product cards
- Responsive hero section with stats

### Shopping Cart (`cart.html`)
- Live cart loaded from backend
- Per-item remove with instant UI update
- Order summary: subtotal, GST (18%), shipping (free above ₹499)
- Promo code field (client-side demo codes: `SAVE10`, `FIRST50`, `SHOPWAVE`)
- Place Order button that calls the backend and redirects to success page

### Order Success (`order-success.html`)
- Reads `orderId` from URL params
- Displays order progress tracker (Confirmed → Processing → Delivery)
- Print receipt shortcut

### Admin Dashboard (`admin.html`)
- Product table with image, category, price, stock, status badges
- Inline search across product name and description
- Add / Edit product via modal form
- Image upload to backend (`/api/upload`) or paste a URL
- Delete product with confirmation
- Dark mode toggle, notifications button (UI scaffolding)

### Backend REST API

| Method | Endpoint             | Description                    |
|--------|----------------------|--------------------------------|
| GET    | `/products`          | List all products              |
| GET    | `/product/{id}`      | Get product by ID              |
| POST   | `/products`          | Add a new product              |
| PUT    | `/products/{id}`     | Update a product               |
| DELETE | `/products/{id}`     | Delete a product               |
| GET    | `/cart`              | Get all cart items (with names)|
| POST   | `/cart/add`          | Add item to cart               |
| DELETE | `/cart/remove/{id}`  | Remove one item from cart      |
| DELETE | `/cart/clear`        | Clear entire cart              |
| POST   | `/order/place`       | Place order from cart          |
| GET    | `/order`             | List all orders                |
| POST   | `/api/upload`        | Upload a product image file    |

---

## ⚙️ Setup & Running

### Prerequisites
- Java 21+
- Maven 3.8+
- MySQL 8+
- A modern browser (Chrome, Firefox, Edge)

### 1. Database Setup

```sql
CREATE DATABASE ecommerce_db;
```

### 2. Configure the Backend

Edit `NewBE/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 3. Run the Backend

```bash
cd NewBE
./mvnw spring-boot:run
```

The API will start on **http://localhost:8080**. Hibernate auto-creates tables on first run (`spring.jpa.hibernate.ddl-auto=update`).

### 4. Open the Frontend

Open `ECommerceFrontend/index.html` directly in your browser or serve it with any static file server (e.g. VS Code Live Server, `npx serve`).

> The frontend expects the backend at `http://localhost:8080`. If you change the port, update the `API_BASE` / `API.BASE` constants in `js/admin.js` and `js/script.js`.

---

## 🔧 What Was Fixed / Cleaned (Code Review Pass)

| File | Change | Reason |
|------|--------|--------|
| `OrderController.java` | Removed `import org.apache.catalina.LifecycleState` | Unused Tomcat-internal import — causes a compile warning and adds an unnecessary dependency on Tomcat internals |
| `FileUploadController.java` | Removed 4 inline `//` comments | Comments removed per cleanup pass |
| `pom.xml` | Removed 2 XML `<!-- -->` comments | Comments removed per cleanup pass |
| `js/admin.js` | Removed duplicate `closeModal()` method definition | Having the same method defined twice in an object literal is a JavaScript error pattern — the second silently overwrites the first |
| `js/admin.js` | Removed `// Minimal: keep dashboard blank if not used.` comment | Comment removed per cleanup pass |
| `js/script.js` | Removed 2 HTML comment blocks inside template literals | These were `<!-- ... -->` strings embedded inside JS template literals; they rendered as HTML comment nodes into the DOM unnecessarily |
| `js/script.js` | Removed `console.log('Tab focused, refreshing products...')` | Debug/development log left in production code |

---

## 📦 Image Uploads

Uploaded product images are stored in the `uploads/` folder at the backend root. The backend serves them as static resources under `/uploads/**`.

Image URL resolution in the frontend:
- Absolute URLs (`http://...`) are used as-is
- Paths starting with `uploads/` are resolved to `http://localhost:8080/uploads/...`
- If no image is provided, the frontend auto-selects a relevant Unsplash demo image based on the product name/category keywords

---

## 🗒️ Notes

- The project does **not** include user authentication on the frontend. The `spring-security-core` dependency is present in `pom.xml` but no web security is auto-configured (no `spring-boot-starter-security`).
- The cart is shared/global (no user sessions) — it is a single cart stored in the database.
- The Orders badge on the admin sidebar is static UI scaffolding.

---

© 2026 ShopWave. All rights reserved.
