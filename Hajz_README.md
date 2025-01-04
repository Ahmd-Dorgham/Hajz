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

## Installation and Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/hajz.git
   cd hajz
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file with the following variables:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/hajz_db
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```

4. **Start the Application**
   ```bash
   npm run dev
   ```
   The server will start on the specified port (default: 3000).

---

## Project Structure

```plaintext
Hajz/
├── Controllers/
├── Middlewares/
├── Models/
├── Routes/
├── Services/
├── Utils/
├── .env
├── index.js
├── package.json
└── README.md
```

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

### Restaurant Routes
| Method | Endpoint                  | Description                     |
|--------|---------------------------|---------------------------------|
| POST   | `/create`                 | Add a new restaurant            |
| PUT    | `/update/:id`             | Update restaurant details       |
| GET    | `/`                       | View all restaurants            |
| GET    | `/owner/:ownerId`         | Restaurants by specific owner   |

### Meal Routes
| Method | Endpoint              | Description                     |
|--------|-----------------------|---------------------------------|
| POST   | `/create`             | Add a new meal                  |
| PUT    | `/update/:id`         | Update meal details             |
| DELETE | `/delete/:id`         | Delete a meal                   |
| GET    | `/restaurant/:id`     | View meals by restaurant        |

### Reservation Routes
| Method | Endpoint                         | Description                     |
|--------|----------------------------------|---------------------------------|
| POST   | `/create`                        | Create a reservation            |
| GET    | `/restaurant/:id/day`            | View daily reservations         |
| PATCH  | `/status/:id`                    | Update reservation status       |

---

## Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch`.
3. Commit your changes: `git commit -m "Add new feature"`.
4. Push to the branch: `git push origin feature-branch`.
5. Submit a pull request.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
