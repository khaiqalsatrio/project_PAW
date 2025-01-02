import _ from "lodash"; // Mengimpor pustaka lodash untuk manipulasi string dan data

// Variabel 'source' menyimpan teks awal
const source = "Khaiqal Satrio";

// Menggunakan metode `_.capitalize` dari lodash untuk mengubah huruf pertama dari string menjadi huruf besar (uppercase),
// sedangkan huruf lainnya menjadi huruf kecil. (Hanya memengaruhi huruf pertama dari string, bukan setiap kata).
const target = _.capitalize(source);

// Menampilkan hasil ke konsol
console.info(target); // Output: "Khaiqal satrio"
