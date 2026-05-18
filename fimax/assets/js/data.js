const seedMovies = [
  {
    id: "m1",
    title: "Kita, Kita Semua, Satu Cerita",
    genre: "Drama",
    duration: 112,
    rating: 8.7,
    price: 45000,
    poster: "assets/img/kita-kita-semua-satu-cerita.png",
    synopsis: "All-Star",
    schedules: ["13:30", "15:40", "18:00", "21:00"]
  },
  {
    id: "m2",
    title: "Taufik",
    genre: "Inspirasi",
    duration: 105,
    rating: 8.3,
    price: 42000,
    poster: "assets/img/taufik.png",
    synopsis: "Perjuangan, tawa, dan tujuan seorang anak muda yang terus berjalan meski arah hidup belum pasti.",
    schedules: ["12:30", "16:10", "19:15"]
  },
  {
    id: "m3",
    title: "Shift Sore",
    genre: "Komedi",
    duration: 98,
    rating: 7.8,
    price: 40000,
    poster: "assets/img/shift-sore.png",
    synopsis: "Kita bukan malas, kita cuma lagi mikir cara hidup setelah wisuda.",
    schedules: ["14:20", "17:30", "20:40"]
  },
  {
    id: "m4",
    title: "Ada Apa Dengan Haidir",
    genre: "Drama Komedi",
    duration: 121,
    rating: 8.9,
    price: 50000,
    poster: "assets/img/ada-apa-dengan-haidir.png",
    synopsis: "Setiap orang punya cerita. Ini cerita Haidir yang penuh pilihan dan konsekuensi.",
    schedules: ["13:00", "15:30", "19:00", "21:20"]
  },
  {
    id: "m5",
    title: "Si Botak Petualang",
    genre: "Petualangan",
    duration: 109,
    rating: 8.1,
    price: 43000,
    poster: "assets/img/si-botak-petualang.png",
    synopsis: "6 Orang berkelana mencari harta karun LOQ",
    schedules: ["12:00", "15:00", "18:30"]
  },
  {
    id: "m6",
    title: "Tunggu Aku di UNM",
    genre: "Drama Persahabatan",
    duration: 102,
    rating: 8.0,
    price: 41000,
    poster: "assets/img/tunggu-aku-di-unm.png",
    synopsis: "Tentang perjalanan, persahabatan, dan mimpi yang dikejar bersama.",
    schedules: ["13:15", "16:45", "20:10"]
  },
  {
    id: "m7",
    title: "Sekawan Limo",
    genre: "Horor Komedi",
    duration: 100,
    rating: 7.9,
    price: 44000,
    poster: "assets/img/sekawan-limo.png",
    synopsis: "Kalau takut, ya rame-rame. Lima sahabat menghadapi teror dengan cara yang lucu.",
    schedules: ["14:00", "18:00", "21:30"]
  },
  {
    id: "m8",
    title: "Dilanda Tugas 1991",
    genre: "Romantis Kampus",
    duration: 95,
    rating: 7.6,
    price: 39000,
    poster: "assets/img/dilanda-tugas-1991.png",
    synopsis: "Hidup dihantam tugas nonstop, lama lama jadi kertas HVS.",
    schedules: ["11:30", "15:15", "19:35"]
  },
  {
    id: "m9",
    title: "Jam Kosong",
    genre: "Komedi Mahasiswa",
    duration: 92,
    rating: 7.5,
    price: 38000,
    poster: "assets/img/jam-kosong.png",
    synopsis: "Katanya cuma merem bentar, tahu-tahu dosen sudah tutup kelas.",
    schedules: ["12:20", "17:00", "20:00"]
  },
  {
    id: "m10",
    title: "Gangster Merah",
    genre: "Aksi",
    duration: 118,
    rating: 8.4,
    price: 48000,
    poster: "assets/img/gangster_merah.jpeg",
    synopsis: "Persahabatan, loyalitas, pengkhianatan. Satu kota, satu aturan, tidak ada ampun.",
    schedules: ["13:45", "17:15", "20:45"]
  },
  {
    id: "m11",
    title: "Pilihan Sasa",
    genre: "Drama",
    duration: 101,
    rating: 8.2,
    price: 42000,
    poster: "assets/img/pilihan-sasa.png",
    synopsis: "Bukan tentang siapa yang terbaik, tapi tentang apa yang terbaik untuk diri sendiri.",
    schedules: ["12:10", "15:50", "19:25"]
  },
  {
    id: "m12",
    title: "Acha 4 Chapter",
    genre: "Aksi",
    duration: 126,
    rating: 9.0,
    price: 55000,
    poster: "assets/img/acha-4-poster.png",
    synopsis: "Every action has consequences. Acha kembali dengan babak baru yang lebih menegangkan.",
    schedules: ["14:00", "16:40", "19:30", "22:00"]
  },
  {
    id: "m13",
    title: "Ayah, Kemana Ini?",
    genre: "Drama Keluarga",
    duration: 108,
    rating: 8.5,
    price: 43000,
    poster: "assets/img/ayah-kemana-ini.png",
    synopsis: "Saat semua orang tahu arah pulang, Fitri masih mencari ayahnya.",
    schedules: ["11:45", "15:25", "18:55"]
  }
];

const seedCinemas = [
  { id: "c1", name: "Panakkukang Makassar", address: "Jl. Pengayoman, Panakkukang, Makassar", movieIds: ["m1", "m2", "m4", "m6", "m12"] },
  { id: "c2", name: "Trans Studio Makassar", address: "Kawasan Tanjung Bunga, Makassar", movieIds: ["m1", "m3", "m4", "m7", "m10"] },
  { id: "c3", name: "Nipah Mall Makassar", address: "Jl. Urip Sumoharjo, Makassar", movieIds: ["m2", "m5", "m6", "m8", "m11"] },
  { id: "c4", name: "Mall Ratu Indah", address: "Jl. Dr. Ratulangi, Makassar", movieIds: ["m3", "m5", "m7", "m9", "m13"] },
  { id: "c5", name: "MTOS", address: "Jl. Perintis Kemerdekaan, Makassar", movieIds: ["m1", "m4", "m8", "m9", "m12"] }
];

const seedFoods = [
  { id: "f1", name: "Popcorn Caramel", category: "Snack", price: 25000, emoji: "🍿", stock: 25 },
  { id: "f2", name: "Popcorn Cheese", category: "Snack", price: 27000, emoji: "🍿", stock: 21 },
  { id: "f3", name: "Coca Cola", category: "Minuman", price: 18000, emoji: "🥤", stock: 40 },
  { id: "f4", name: "Ice Lemon Tea", category: "Minuman", price: 16000, emoji: "🧋", stock: 34 },
  { id: "f5", name: "Hot Dog", category: "Makanan", price: 32000, emoji: "🌭", stock: 16 },
  { id: "f6", name: "Nachos", category: "Snack", price: 30000, emoji: "🧀", stock: 14 },
  { id: "f7", name: "Paket Couple", category: "Paket", price: 72000, emoji: "🎬", stock: 10 },
  { id: "f8", name: "French Fries", category: "Snack", price: 22000, emoji: "🍟", stock: 30 }
];
