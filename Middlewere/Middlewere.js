function isAuthenticated(req, res, next) {
  // Periksa apakah ada session dengan userId
  if (req.session.userId) {
    // Jika userId ada dalam session, lanjutkan ke middleware atau route handler berikutnya
    return next();
  } else {
    // Jika userId tidak ada, redirect user ke halaman login
    res.redirect("/login");
  }
}

// Ekspor fungsi isAuthenticated agar dapat digunakan di file lain
module.exports = { isAuthenticated };
