const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../Database/db");
const router = express.Router();

// Fungsi untuk validasi input
function validateInput(username, password) {
    if (!username || !password) {
        return "Username and password are required";
    }
    if (username.length < 3 || password.length < 6) {
        return "Username must be at least 3 characters and password at least 6 characters";
    }
    return null;
}

// Halaman Registrasi admin
router.get("/registerAdmin", (req, res) => {
    res.render("registerAdmin", { layout: "layout/main-layout" });
});

// Proses Registrasi admin
router.post("/registerAdmin", (req, res) => {
    const { username, password } = req.body;
    // Validasi input
    const error = validateInput(username, password);
    if (error) {
        return res.status(400).json({ error });
    }
    // Hash password menggunakan bcrypt
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        // Query untuk memasukkan user baru ke database
        const query = "INSERT INTO admin (username, password) VALUES (?, ?)";
        db.query(query, [username, hash], (err, result) => {
            if (err) {
                console.error("Error inserting user into database:", err);
                return res.status(500).json({ error: "Failed to register user" });
            }
            res.redirect("/loginAdmin");
        });
    });
});

// Halaman Login
router.get("/loginAdmin", (req, res) => {
    res.render("loginAdmin", { layout: "layout/main-layout" });
});

// Proses Login
router.post("/loginAdmin", (req, res) => {
    const { username, password } = req.body;
    // Validasi input
    if (!username || !password) {
        return res.redirect(
            "/loginAdmin?error=true&message=Username%20and%20password%20are%20required"
        );
    }
    // Query untuk mencari user berdasarkan username
    const query = "SELECT id, username, password FROM admin WHERE username = ?";
    db.query(query, [username], (err, result) => {
        if (err) {
            console.error("Error fetching user:", err);
            return res.redirect(
                "/loginAdmin?error=true&message=Internal%20server%20error"
            );
        }
        // Jika user tidak ditemukan
        if (!result || result.length === 0) {
            return res.redirect("/loginAdmin?error=true&message=User%20not%20found");
        }
        // Bandingkan password
        bcrypt.compare(password, result[0].password, (err, isMatch) => {
            if (err) {
                console.error("Error checking password:", err);
                return res.redirect(
                    "/loginAdmin?error=true&message=Internal%20server%20error"
                );
            }
            if (!isMatch) {
                return res.redirect(
                    "/loginAdmin?error=true&message=Incorrect%20password"
                );
            }
            // Simpan userId dan username ke dalam session
            req.session.userId = result[0].id;
            req.session.username = result[0].username;
            res.redirect("/indexAdmin");
        });
    });
});

// Proses Logout
router.post("/logoutAdmin", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Error logging out");
        }
        res.redirect("/loginAdmin");
    });
});

// Rute untuk halaman index admin
router.get("/indexAdmin", (req, res) => {
    // Pastikan session memiliki username
    if (!req.session || !req.session.username) {
        return res.redirect("/loginAdmin?error=true&message=Please%20login%20first");
    }
    // Query untuk mendapatkan data customer
    const query = "SELECT * FROM customer";
    db.query(query, (err, result) => {
        if (err) {
            console.error("Error fetching customer data:", err);
            return res.status(500).send("Internal Server Error");
        }
        // Render halaman index admin dengan data customer
        res.render("indexAdmin", {
            layout: "layout/main-layout", // Gunakan layout utama
            username: req.session.username, // Kirim username ke template
            customer: result, // Kirim data customer ke template
        });
    });
});

// Halaman Registrasi jenis kamar
router.get("/jenisKamar", (req, res) => {
    res.render("jenisKamar", { layout: "layout/main-layout" });
});

// route halaman data kamar
router.get('/dataKamar', (req, res) => {
    // Query untuk mendapatkan data kamar
    const query = "SELECT * FROM room";
    db.query(query, (err, result) => {
        if (err) {
            console.error("Error fetching room data:", err);
            return res.render("dataKamar", { room: [] });
        }
        // Kirim data ke template
        res.render("dataKamar", { room: result });
    });
});

// Menghapus room berdasarkan ID
router.delete("/:id", (req, res) => {
    const { id } = req.params; // Ambil ID dari parameter URL
    // Validasi ID
    if (!id || isNaN(id)) {
    return res.status(400).send("ID tidak valid");
    }
    // Query untuk menghapus data customer berdasarkan ID
    db.query("DELETE FROM room WHERE id = ?", [id], (err, results) => {
    if (err) {
        console.error("Error saat menghapus data:", err);
        return res.status(500).send("Internal Server Error"); // Error pada server
    }
    if (results.affectedRows === 0) {
        return res.status(404).send("Room tidak ditemukan"); // Jika data tidak ditemukan
    }
      res.status(204).send(); // Kirim respons kosong (data berhasil dihapus)
    });
});


// Proses save data kamar
router.post("/submitKamar", (req, res) => {
    const { nama_kamar, harga_kamar, deskripsi_kamar } = req.body;

    if (!nama_kamar || !harga_kamar || !deskripsi_kamar) {
        return res.status(400).json({ error: "Semua field harus diisi" });
    }

    const query = "INSERT INTO room (nama_kamar, harga_kamar, deskripsi_kamar) VALUES (?, ?, ?)";
    const values = [nama_kamar, harga_kamar, deskripsi_kamar];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Error inserting data into database:", err);
            return res.status(500).json({ error: "Gagal menyimpan data kamar" });
        }
        // Redirect ke halaman data kamar setelah berhasil menyimpan data
        res.redirect("/dataKamar"); // Ganti dengan route yang sesuai untuk halaman data kamar
    });
});



module.exports = router;
