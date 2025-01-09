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

// Menonaktifkan penggunaan layout
app.set('layout', false);

// Rute admin
app.use("/", adminRoutes);
app.use("/jenisKamar", adminRoutes);
app.use("/dataKamar", adminRoutes);
app.use("/indexAdmin", customerRoutes);

// Rute untuk menampilkan data customer di halaman admin
app.get("/indexAdmin-view", isAuthenticated, (req, res) => {
  db.query("SELECT * FROM customer", (err, customers) => {
    if (err) {
      console.error("Error fetching dataCustomer data:", err); // Tampilkan error jika query gagal
      return res.status(500).send("Internal Server Error");
    }
    res.render("indexAdmin", {
      layout: "layout/main-layout.ejs", // Gunakan layout utama
      customers, // Kirimkan data customer ke template
    });
  });
});

// Rute untuk menampilkan data kamar
app.get("/dataKamar-view", isAuthenticated, (req, res) => {
  db.query("SELECT * FROM room", (err, rooms) => {
    if (err) {
      console.error("Error fetching room data:", err); // Tampilkan error jika query gagal
      return res.status(500).send("Internal Server Error");
    }
    res.render("dataKamar", {
      layout: "layout/main-layout.ejs", // Gunakan layout utama
      rooms, // Kirimkan data kamar ke template
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
  db.query('SELECT nama_kamar, harga_kamar FROM room', (err, results) => {
    if (err) {
      console.error('Database query error:', err.message);
      res.status(500).send('Terjadi kesalahan saat mengambil data kamar.');
    } else {
      res.render('booking', { layout: 'layout/main-layout.ejs', booking: results });
    }
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
  const username = req.user.username; // Sesuaikan dengan bagaimana Anda menyimpan username setelah login
  
  db.query("SELECT * FROM customer WHERE username = ?", [username], (err, customer) => {
    if (err) {
      console.error("Error fetching dataCustomer data:", err); // Tampilkan error jika query gagal
      return res.status(500).send("Internal Server Error");
    }
    if (customer.length === 0) {
      return res.render("dataCustomer", {
        layout: "layout/main-layout.ejs",
        customer: [],
        message: "Data tidak ditemukan untuk username yang digunakan",
      });
    }
    res.render("dataCustomer", {
      layout: "layout/main-layout.ejs",
      customer,
    });
  });
});

// Endpoint untuk mendapatkan data kamar
app.get('/rooms', (req, res) => {
  db.query('SELECT nama_kamar, harga_kamar FROM room', (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'Database query error' });
    } else {
      res.json(results);
    }
  });
});

app.delete('/indexAdmin/:id', (req, res) => {
  const id = req.params.id;
  // Proses penghapusan data di database
  db.query('DELETE FROM room WHERE id = ?', [id], (err, result) => {
      if (err) {
          return res.status(500).send('Kesalahan saat menghapus data.');
      }
      res.status(200).send('Data berhasil dihapus.');
  });
});



// Jalankan server di port yang sudah ditentukan
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
