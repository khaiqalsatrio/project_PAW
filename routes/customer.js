const express = require("express");
const router = express.Router();
const db = require("../Database/db");
const { isAuthenticated } = require("../Middlewere/Middlewere");

// Mendapatkan semua data customer
router.get("/", (req, res) => {
  // Query untuk mengambil semua data dari tabel customer
  db.query("SELECT * FROM customer", (err, results) => {
    if (err) return res.status(500).send("Internal Server Error"); // Error pada server
    res.json(results); // Kirim hasil query dalam bentuk JSON
  });
});

// Mendapatkan customer berdasarkan ID
router.get("/:id", (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL
  db.query("SELECT * FROM customer WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).send("Internal Server Error"); // Error pada server
    if (results.length === 0)
      return res.status(404).send("Customer tidak ditemukan"); // Jika data tidak ditemukan
    res.json(results[0]); // Kirim data customer yang ditemukan
  });
});

// Menyimpan data customer baru
router.post("/", isAuthenticated, (req, res) => {
  const {
    nama,
    email,
    phone_number,
    jenis_room,
    check_in_date,
    check_out_date,
    harga,
  } = req.body; // Ambil data dari body request

  // Ambil username dari session pengguna yang sedang login
  const username = req.session.username;

  // Validasi input
  if (
    !nama ||
    !email ||
    !phone_number ||
    !jenis_room ||
    !check_in_date ||
    !check_out_date ||
    !harga ||
    !username
  ) {
    return res.status(400).send("Semua field harus diisi");
  }

  // Konversi harga menjadi angka
  const hargaNumber = parseInt(harga, 10);
  if (isNaN(hargaNumber)) {
    return res.status(400).send("Harga harus berupa angka");
  }

  // Query untuk menyimpan data baru ke tabel customer
  db.query(
    "INSERT INTO customer (nama, email, phone_number, jenis_room, check_in_date, check_out_date, harga, username) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      nama.trim(),
      email.trim(),
      phone_number.trim(),
      jenis_room.trim(),
      check_in_date,
      check_out_date,
      hargaNumber,
      username.trim(),
    ],
    (err, results) => {
      if (err) {
        console.error("Error inserting customer:", err);
        return res.status(500).send("Internal Server Error"); // Error pada server
      }
      res.status(201).json({
        id: results.insertId, // ID dari data yang baru ditambahkan
        nama,
        email,
        phone_number,
        jenis_room,
        check_in_date,
        check_out_date,
        harga: hargaNumber,
        username,
      });
    }
  );
});


// Mengedit data customer berdasarkan ID
router.put("/:id", (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL
  const {
    nama,
    email,
    phone_number,
    jenis_room,
    check_in_date,
    check_out_date,
    harga,
  } = req.body; // Ambil data dari body request

  // Validasi input
  if (
    !nama ||
    !email ||
    !phone_number ||
    !jenis_room ||
    !check_in_date ||
    !check_out_date ||
    !harga
  ) {
    return res.status(400).send("Semua field harus diisi");
  }

  // Konversi harga menjadi angka
  const hargaNumber = parseInt(harga, 10);
  if (isNaN(hargaNumber)) {
    return res.status(400).send("Harga harus berupa angka");
  }

  // Query untuk memperbarui data customer berdasarkan ID
  db.query(
    "UPDATE customer SET nama = ?, email = ?, phone_number = ?, jenis_room = ?, check_in_date = ?, check_out_date = ?, harga = ? WHERE id = ?",
    [
      nama.trim(),
      email.trim(),
      phone_number.trim(),
      jenis_room.trim(),
      check_in_date,
      check_out_date,
      hargaNumber,
      id,
    ],
    (err, results) => {
      if (err) return res.status(500).send("Internal Server Error"); // Error pada server
      if (results.affectedRows === 0)
        return res.status(404).send("Customer tidak ditemukan"); // Jika data tidak ditemukan
      res.json({
        id,
        nama,
        email,
        phone_number,
        jenis_room,
        check_in_date,
        check_out_date,
        harga: hargaNumber,
      }); // Kirim data yang telah diperbarui
    }
  );
});

// Menghapus customer berdasarkan ID
router.delete("/:id", (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL

  // Validasi ID
  if (!id || isNaN(id)) {
    return res.status(400).send("ID tidak valid");
  }
  // Query untuk menghapus data customer berdasarkan ID
  db.query("DELETE FROM customer WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Error saat menghapus data:", err);
      return res.status(500).send("Internal Server Error"); // Error pada server
    }
    if (results.affectedRows === 0) {
      return res.status(404).send("Customer tidak ditemukan"); // Jika data tidak ditemukan
    }
    res.status(204).send(); // Kirim respons kosong (data berhasil dihapus)
  });
});


// Ekspor router agar dapat digunakan di file lain
module.exports = router;
