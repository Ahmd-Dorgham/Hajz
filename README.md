# Hajz – Restaurant Reservation System

Hajz is a powerful and user-friendly restaurant reservation system designed to streamline restaurant operations and enhance user experience. The system allows restaurant owners to manage reservations, meals, tables, and VIP rooms efficiently, while users can explore restaurants, book reservations, and provide feedback seamlessly.

---

## Key Features

### For Users:
- **Reservation Management:** Book, update, and cancel reservations with ease.
- **Restaurant Discovery:** Search for restaurants by categories such as desserts, drinks, and more.
- **Reviews:** Share feedback and rate restaurants.
- **User Account Management:** Sign up, update profiles, and manage favorite restaurants.

### For Restaurant Owners:
- **Meal Management:** Create, update, and delete meals, complete with image uploads.
- **Table Management:** Add, edit, or remove tables to optimize seating arrangements.
- **VIP Room Management:** Showcase exclusive VIP rooms with images.
- **Reservation Insights:** Track reservations by day, table, or user.
- **Restaurant Profile Management:** Update restaurant details, gallery, and layout images.

---

## Technologies Used

### Backend:
- **Node.js** and **Express**: For building a robust server.
- **MongoDB** with **Mongoose**: For database management.
- **JWT (jsonwebtoken)**: Secure authentication.

### Utilities:
- **bcrypt**: For password hashing.
- **multer** and **cloudinary**: For handling image uploads and storage.
- **nodemailer**: For sending emails.
- **luxon**: Date and time manipulation.
- **dotenv**: Managing environment variables.

---

## Routes Overview

### User Routes
| Method | Endpoint            | Description             |
|--------|---------------------|-------------------------|
| POST   | `/signup`           | User registration       |
| POST   | `/signin`           | User login              |
| GET    | `/profile`          | View user profile       |
| PUT    | `/update`           | Update profile details  |
| POST   | `/favorites/add`    | Add favorite restaurant |
| GET    | `/favorites`        | View favorite restaurants |
| GET    | `/verify/:token`    | Verify user email       |
| GET    | `/verify-status`    | Check verification status |
| PATCH  | `/change-password`  | Change password         |
| DELETE | `/delete-account`   | Delete user account     |
| POST   | `/forgot-password`  | Send password reset request |
| POST   | `/reset-password`   | Reset user password     |

### Restaurant Routes
| Method | Endpoint                  | Description                     |
|--------|---------------------------|---------------------------------|
| POST   | `/create`                 | Add a new restaurant            |
| PUT    | `/update/:id`             | Update restaurant details       |
| GET    | `/`                       | View all restaurants            |
| GET    | `/owner/:ownerId`         | Restaurants by specific owner   |
| DELETE | `/delete/:id`             | Delete a restaurant             |
| GET    | `/search`                 | Search restaurants by category  |

### Meal Routes
| Method | Endpoint              | Description                     |
|--------|-----------------------|---------------------------------|
| POST   | `/create`             | Add a new meal                  |
| PUT    | `/update/:id`         | Update meal details             |
| DELETE | `/delete/:id`         | Delete a meal                   |
| GET    | `/restaurant/:id`     | View meals by restaurant        |
| GET    | `/:id`                | Get meal details by ID          |

### Reservation Routes
| Method | Endpoint                         | Description                     |
|--------|----------------------------------|---------------------------------|
| POST   | `/create`                        | Create a reservation            |
| PUT    | `/update/:id`                    | Update reservation              |
| DELETE | `/delete/:id`                    | Delete reservation              |
| GET    | `/restaurant/:id`                | Reservations by restaurant      |
| PATCH  | `/status/:id`                    | Update reservation status       |
| GET    | `/user`                          | View user’s reservations       |
| GET    | `/table/:tableId`                | Reservations by table ID        |
| GET    | `/restaurant/:restaurantId/day`  | Daily reservations by restaurant |
| GET    | `/:id`                           | Get specific reservation        |

### Review Routes
| Method | Endpoint                  | Description                     |
|--------|---------------------------|---------------------------------|
| POST   | `/create`                 | Add a review                    |
| PUT    | `/update/:id`             | Update a review                 |
| DELETE | `/delete/:id`             | Delete a review                 |
| GET    | `/restaurant/:id`         | View reviews for a restaurant   |

### Table Routes
| Method | Endpoint                       | Description                     |
|--------|--------------------------------|---------------------------------|
| POST   | `/create`                      | Add a new table                 |
| PUT    | `/update/:id`                  | Update table details            |
| DELETE | `/delete/:id`                  | Delete a table                  |
| GET    | `/restaurant/:id`             | View tables for a restaurant    |
| GET    | `/:id`                        | View table details by ID        |

### VIP Room Routes
| Method | Endpoint                       | Description                     |
|--------|--------------------------------|---------------------------------|
| POST   | `/create`                      | Add a new VIP room              |
| PATCH  | `/update/:id`                  | Update VIP room details         |
| DELETE | `/delete/:id`                  | Delete a VIP room               |
| GET    | `/restaurant/:id`             | View VIP rooms for a restaurant |
| GET    | `/:id`                        | View VIP room details by ID     |

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
