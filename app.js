const express = require("express");
const customerRoutes = require("./routes/customer"); // Rute untuk customer
const adminRoutes = require("./routes/adminRoutes"); // Rute untuk admin
const authRoutes = require("./routes/authRoutes"); // Rute untuk autentikasi
const session = require("express-session"); // Middleware untuk session
const expressLayout = require("express-ejs-layouts"); // Middleware untuk layout EJS
const db = require("./Database/db"); // Koneksi database
require("dotenv").config(); // Memuat variabel lingkungan dari .env

const { isAuthenticated } = require("./Middlewere/Middlewere"); // Middleware untuk autentikasi

const app = express();
const port = process.env.PORT || 3000; // Default ke port 3000 jika tidak ada di .env

// Middleware untuk parsing JSON dan form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk mengakses file statis (CSS, JS, dll.)
app.use(express.static("public"));

// Middleware untuk layout EJS
app.use(expressLayout);

// Set view engine ke EJS untuk render template
app.set("view engine", "ejs");

// Middleware untuk session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultSecretKey", // Kunci rahasia dari .env
    resave: false, // Jangan simpan ulang session jika tidak ada perubahan
    saveUninitialized: false, // Jangan simpan session kosong
    cookie: {
      secure: process.env.NODE_ENV === "production", // Aktifkan secure hanya jika menggunakan HTTPS
      maxAge: 24 * 60 * 60 * 1000, // Durasi session: 24 jam
    },
  })
);

// Rute admin
app.use("/", adminRoutes);

// Rute untuk login/logout admin
app.use("/", adminRoutes);

app.use("/indexAdmin", customerRoutes);

// Rute untuk menampilkan data customer di halaman admin
app.get("/indexAdmin-view", isAuthenticated, (req, res) => {
  db.query("SELECT * FROM customer", (err, customer) => {
    if (err) {
      console.error("Error fetching dataCustomer data:", err); // Tampilkan error jika query gagal
      return res.status(500).send("Internal Server Error");
    }
    res.render("indexAdmin", {
      layout: "layout/main-layout.ejs", // Gunakan layout utama
      customer, // Kirimkan data customer ke template
    });
  });
});


// Rute untuk logout admin
app.get("/logoutAdmin", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error saat logout:", err);
      return res.status(500).send("Error saat logout");
    }
    res.redirect("/loginAdmin"); // Arahkan kembali ke halaman login
  });
});


// Rute customer
app.use("/dataCustomer", customerRoutes);

// Rute untuk login/logout
app.use("/", authRoutes);

// Rute untuk halaman utama (akses hanya jika user login)
app.get("/", isAuthenticated, (req, res) => {
  res.render("index", {
    layout: "layout/main-layout.ejs", // Gunakan layout utama
  });
});

// Rute untuk halaman booking (akses hanya jika user login)
app.get("/booking", isAuthenticated, (req, res) => {
  res.render("booking", {
    layout: "layout/main-layout.ejs", // Gunakan layout utama
  });
});

// Rute untuk halaman tambah customer
app.get("/tambahCustomer", isAuthenticated, (req, res) => {
  const username = req.session.username; // Ambil username dari sesi
  res.render("tambahCustomer", { username }); // Kirim username ke template EJS
});

// Rute untuk logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error saat logout:", err);
      return res.status(500).send("Error saat logout");
    }
    res.redirect("/login"); // Arahkan kembali ke halaman login
  });
});

// Rute untuk menampilkan data customer
app.get("/dataCustomer-view", isAuthenticated, (req, res) => {
  // Ambil username dari session atau req.user
  const username = req.user.username; // Sesuaikan dengan bagaimana Anda menyimpan username setelah login
  
  // Query untuk mencari data customer berdasarkan username
  db.query("SELECT * FROM customer WHERE username = ?", [username], (err, customer) => {
    if (err) {
      console.error("Error fetching dataCustomer data:", err); // Tampilkan error jika query gagal
      return res.status(500).send("Internal Server Error");
    }
    // Cek apakah ada data customer yang ditemukan
    if (customer.length === 0) {
      return res.render("dataCustomer", {
        layout: "layout/main-layout.ejs", // Gunakan layout utama
        customer: [], // Kirimkan array kosong jika tidak ada data yang cocok
        message: "Data tidak ditemukan untuk username yang digunakan", // Pesan tambahan jika tidak ada data
      });
    }
    // Kirimkan data customer yang ditemukan ke template
    res.render("dataCustomer", {
      layout: "layout/main-layout.ejs", // Gunakan layout utama
      customer, // Kirimkan data customer ke template
    });
  });
});


// Jalankan server di port yang sudah ditentukan
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`); // Informasi server berjalan
});
