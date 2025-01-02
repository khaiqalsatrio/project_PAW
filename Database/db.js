// Import package mysql2 untuk dapat menggunakan MySQL dalam Node.js
const mysql = require("mysql2");

// Menggunakan dotenv untuk memuat konfigurasi dari file .env
require("dotenv").config();

// Membuat koneksi ke database MySQL dengan konfigurasi yang diambil dari variabel environment (.env file)
const connection = mysql.createConnection({
  host: process.env.DB_HOST, // Menentukan host untuk server database (misalnya 'localhost')
  user: process.env.DB_USER, // Menentukan username untuk login ke database
  password: process.env.DB_PASSWORD, // Menentukan password untuk user
  database: process.env.DB_NAME, // Menentukan nama database yang akan digunakan
});

// Membuat koneksi ke MySQL dan menangani error jika koneksi gagal
connection.connect((err) => {
  if (err) {
    // Jika ada error saat mencoba terhubung
    console.error("Error connecting to the database:", err); // Mencetak error ke konsol
    return; // Menghentikan eksekusi lebih lanjut jika gagal
  }
  console.log("Connected to the MySQL database."); // Mencetak pesan berhasil terhubung ke database
});

// Mengekspor koneksi untuk digunakan di file lain
module.exports = connection;
