function isAuthenticated(req, res, next) {
  // Pastikan ada session dengan userId dan username
  if (req.session && req.session.userId && req.session.username) {
    // Jika sesi valid, lanjutkan ke middleware berikutnya
    console.log("User is authenticated:", req.session.userId); // Debugging
    req.user = { // Menyimpan data pengguna di req.user untuk digunakan di rute
      userId: req.session.userId,
      username: req.session.username,
    };
    return next();
  }

  // Jika ini adalah permintaan API (XHR atau JSON)
  if (req.xhr || req.headers.accept.indexOf("json") > -1) {
    console.log("API request unauthorized");
    return res.status(401).json({ error: "Unauthorized access, please login first" });
  }

  // Jika ini bukan API, redirect ke halaman login
  console.log("Redirecting to login page");
  res.redirect("/login?error=true&message=Please%20login%20first");
}

module.exports = { isAuthenticated };
