const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../Database/db");
const router = express.Router();

// Halaman Registrasi
router.get("/register", (req, res) => {
  // Render halaman register dengan layout utama
  res.render("register", {
    layout: "layout/main-layout",
  });
});

// Proses Registrasi
router.post("/register", (req, res) => {
  const { username, password } = req.body; // Ambil data dari body request
  // Validasi input
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }
  if (username.length < 3 || password.length < 6) {
    return res.status(400).json({
      error:
        "Username must be at least 3 characters and password at least 6 characters",
    });
  }
  // Hash password menggunakan bcrypt
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error("Error hashing password:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    // Query untuk memasukkan user baru ke database
    const query = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(query, [username, hash], (err, result) => {
      if (err) {
        console.error("Error inserting user into database:", err);
        return res.status(500).json({ error: "Failed to register user" });
      }
      // Berhasil registrasi, redirect ke halaman login
      res.redirect("/login");
    });
  });
});

// Halaman Login
router.get("/login", (req, res) => {
  // Render halaman login dengan layout utama
  res.render("login", {
    layout: "layout/main-layout",
  });
});

// Proses Login
router.post("/login", (req, res) => {
  const { username, password } = req.body; // Ambil data dari body request
  // Validasi input
  if (!username || !password) {
    return res.redirect(
      "/login?error=true&message=Username%20and%20password%20are%20required"
    );
  }
  // Query untuk mencari user berdasarkan username
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, result) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res.redirect(
          "/login?error=true&message=Internal%20server%20error"
        );
      }
      // Jika user tidak ditemukan
      if (result.length === 0) {
        return res.redirect("/login?error=true&message=User%20not%20found");
      }
      // Bandingkan password yang diberikan dengan password yang disimpan
      bcrypt.compare(password, result[0].password, (err, isMatch) => {
        if (err) {
          console.error("Error checking password:", err);
          return res.redirect(
            "/login?error=true&message=Internal%20server%20error"
          );
        }
        // Jika password tidak cocok
        if (!isMatch) {
          return res.redirect("/login?error=true&message=Incorrect%20password");
        }
        // Password cocok, buat session untuk user
        req.session.userId = result[0].id; // Simpan userId di session
        req.session.username = result[0].username; // Simpan username di session
        res.redirect("/index"); // Redirect ke halaman utama
      });
    }
  );
});

// Proses Logout
router.post("/logout", (req, res) => {
  // Hapus session user
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out");
    }
    // Redirect ke halaman login setelah logout
    res.redirect("/login");
  });
});

// Rute untuk Mendapatkan Username
router.get("/getUser", (req, res) => {
  // Periksa apakah user sudah login
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not logged in" });
  }
  // Kirim username yang disimpan dalam session
  res.json({ username: req.session.username });
});

// Rute untuk halaman index 
router.get("/index", (req, res) => {
  // Pastikan session memiliki username
  if (!req.session || !req.session.username) {
      return res.redirect("/loginAdmin?error=true&message=Please%20login%20first");
  }
  
  // Query untuk mendapatkan data customer
  const customerQuery = "SELECT * FROM customer";
  const roomQuery = "SELECT * FROM room";  // Query untuk mendapatkan data kamar
  
  // Ambil data customer dan kamar secara bersamaan
  db.query(customerQuery, (errCustomer, resultCustomer) => {
    if (errCustomer) {
        console.error("Error fetching customer data:", errCustomer);
        return res.status(500).send("Internal Server Error");
    }
    
    db.query(roomQuery, (errRoom, resultRoom) => {
      if (errRoom) {
          console.error("Error fetching room data:", errRoom);
          return res.status(500).send("Internal Server Error");
      }
      
      // Render halaman index admin dengan data customer dan room
      res.render("index", {
          layout: "layout/main-layout", // Gunakan layout utama
          username: req.session.username, // Kirim username ke template
          customer: resultCustomer, // Kirim data customer ke template
          rooms: resultRoom, // Kirim data kamar ke template
      });
    });
  });
});


module.exports = router;
