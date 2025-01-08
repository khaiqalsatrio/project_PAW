function isAdmin(req, res, next) {
    // Periksa apakah ada session dengan userId dan role adalah admin
    if (req.session.userId && req.session.role === "admin") {
        // Jika userId ada dan role adalah admin, lanjutkan ke middleware atau route handler berikutnya
        return next();
    } else {
        // Jika tidak, redirect user ke halaman login admin dengan pesan error
        return res.redirect("/loginAdmin?error=true&message=Anda%20tidak%20memiliki%20akses%20ke%20halaman%20ini");
    }
}

// Ekspor fungsi isAdmin agar dapat digunakan di file lain
module.exports = { isAdmin };
