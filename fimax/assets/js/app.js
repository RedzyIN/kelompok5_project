const movieStore = new DynamicArray(JSON.parse(localStorage.getItem("fimax_movies")) || seedMovies);
const foodStore = new DynamicArray(JSON.parse(localStorage.getItem("fimax_foods")) || seedFoods);
const cinemaStore = new DynamicArray(seedCinemas);
const activityStack = new Stack();
const paymentQueue = new Queue();
const cinemaLinkedList = new LinkedList();
let userTickets = JSON.parse(localStorage.getItem("fimax_tickets")) || [];
let foodOrders = JSON.parse(localStorage.getItem("fimax_food_orders")) || [];

// Seat data per cinema (persisted)
function getSeatData(cinemaId, movieId, schedule) {
  const key = `fimax_seats_${cinemaId}_${movieId}_${schedule}`;
  return JSON.parse(localStorage.getItem(key)) || [];
}
function saveSeatData(cinemaId, movieId, schedule, takenSeats) {
  const key = `fimax_seats_${cinemaId}_${movieId}_${schedule}`;
  localStorage.setItem(key, JSON.stringify(takenSeats));
}

cinemaStore.getAll().forEach(cinema => cinemaLinkedList.append(cinema));

function upgradeMovieDataFromSeed() {
  const storedMovies = movieStore.getAll();
  const storedIds = new Set(storedMovies.map(movie => movie.id));
  const storedTitles = new Set(storedMovies.map(movie => movie.title.toLowerCase()));

  seedMovies.forEach(seed => {
    const existingById = storedMovies.find(movie => movie.id === seed.id);
    const existingByTitle = storedMovies.find(movie => movie.title.toLowerCase() === seed.title.toLowerCase());

    if (existingById) {
      movieStore.update(existingById.id, {
        poster: seed.poster,
        title: seed.title,
        genre: seed.genre,
        duration: seed.duration,
        rating: seed.rating,
        price: seed.price,
        synopsis: seed.synopsis,
        schedules: seed.schedules
      });
      return;
    }

    if (existingByTitle) {
      movieStore.update(existingByTitle.id, {
        poster: seed.poster,
        title: seed.title,
        genre: seed.genre,
        duration: seed.duration,
        rating: seed.rating,
        price: seed.price,
        synopsis: seed.synopsis,
        schedules: seed.schedules
      });
      return;
    }

    if (!storedIds.has(seed.id) && !storedTitles.has(seed.title.toLowerCase())) {
      movieStore.add(seed);
      storedIds.add(seed.id);
      storedTitles.add(seed.title.toLowerCase());
    }
  });

  saveLocalData();
}

upgradeMovieDataFromSeed();

let authMode = "signin";
let currentUser = JSON.parse(localStorage.getItem("fimax_user")) || null;
let activeCinemaId = null;
let editingType = null;
let editingId = null;

// Track currently selected ticket info for food ordering
let lastSelectedTicket = null; // { movieTitle, schedule }

// Seat selection state (temp, during purchase flow)
let seatSelectionState = null;

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

function saveLocalData() {
  localStorage.setItem("fimax_movies", JSON.stringify(movieStore.getAll()));
  localStorage.setItem("fimax_foods", JSON.stringify(foodStore.getAll()));
  localStorage.setItem("fimax_tickets", JSON.stringify(userTickets));
  localStorage.setItem("fimax_food_orders", JSON.stringify(foodOrders));
}

function rupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(number);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2600);
}

function showPage(id) {
  $$(".page").forEach(page => page.classList.remove("active"));
  const pageEl = $(`#page${id[0].toUpperCase() + id.slice(1)}`);
  if (pageEl) pageEl.classList.add("active");

  $$(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.nav === id);
  });

  activityStack.push(`Membuka halaman ${id}`);
  renderAccount();
  renderSchedule();

  if (id === "account") {
    accountSection = null;
    renderAccountPage();
  }
}

function showMainApp() {
  $("#landingPage").classList.add("hidden");
  $("#authPage").classList.add("hidden");
  $("#mainApp").classList.remove("hidden");
  renderAll();
}

function showAuth(mode) {
  authMode = mode;
  $("#landingPage").classList.add("hidden");
  $("#mainApp").classList.add("hidden");
  $("#authPage").classList.remove("hidden");

  const isSignup = mode === "signup";
  $("#authTitle").textContent = isSignup ? "Sign up" : "Sign in";
  $("#authSubmit").textContent = isSignup ? "Create account" : "Sign in";
  $("#emailGroup").style.display = isSignup ? "block" : "block";
  $("#passwordGroup").style.display = isSignup ? "block" : "none";
  $("#authSwitchText").innerHTML = isSignup
    ? 'Sudah memiliki akun? <button type="button" id="switchAuth">Sign in</button>'
    : 'Belum memiliki akun? <button type="button" id="switchAuth">Sign up</button>';

  $("#switchAuth").addEventListener("click", () => showAuth(isSignup ? "signin" : "signup"));
}

function renderAll() {
  renderNowPlaying();
  renderMovies();
  renderCinemas();
  renderFoods();
  renderAccount();
}

function makePoster(title, poster = "") {
  if (poster) {
    return `<div class="poster poster-image"><img src="${poster}" alt="Poster ${title}" onerror="this.closest('.poster').classList.remove('poster-image'); this.closest('.poster').innerHTML='<div class=&quot;poster-title&quot;>${title}</div>';"></div>`;
  }
  return `<div class="poster"><div class="poster-title">${title}</div></div>`;
}

// Movie card: no Pesan/Edit/Hapus buttons on film page; cinema uses full card with Pesan
function movieCard(movie, compact = false, isCinema = false) {
  if (isCinema) {
    // Cinema page: show Pesan button
    return `
      <article class="movie-card">
        ${makePoster(movie.title, movie.poster)}
        <div class="movie-info">
          <h4>${movie.title}</h4>
          <div class="meta">
            <span>${movie.genre}</span>
            <span>${movie.duration} menit</span>
            <span>⭐ ${movie.rating}</span>
          </div>
          <div class="card-actions">
            <button class="icon-btn red" data-detail-movie="${movie.id}" data-cinema-context="${activeCinemaId || ''}">Pesan</button>
          </div>
        </div>
      </article>
    `;
  }

  if (compact) {
    // Now Playing section (beranda): show Pesan button
    return `
      <article class="movie-card">
        ${makePoster(movie.title, movie.poster)}
        <div class="movie-info">
          <h4>${movie.title}</h4>
          <div class="meta">
            <span>${movie.genre}</span>
            <span>${movie.duration} menit</span>
            <span>⭐ ${movie.rating}</span>
          </div>
          <div class="card-actions">
            <button class="icon-btn red" data-detail-movie="${movie.id}" data-cinema-context="">Pesan</button>
          </div>
        </div>
      </article>
    `;
  }

  // Film page: info only, clicking opens detail (no Pesan/Edit/Hapus)
  return `
    <article class="movie-card" style="cursor:pointer" data-film-detail="${movie.id}">
      ${makePoster(movie.title, movie.poster)}
      <div class="movie-info">
        <h4>${movie.title}</h4>
        <div class="meta">
          <span>${movie.genre}</span>
          <span>${movie.duration} menit</span>
          <span>⭐ ${movie.rating}</span>
        </div>
      </div>
    </article>
  `;
}

function renderNowPlaying() {
  $("#nowPlayingList").innerHTML = movieStore.getAll().slice(0, 6).map(movie => movieCard(movie, true, false)).join("");
}

function renderMovies(list = movieStore.getAll()) {
  $("#movieGrid").innerHTML = list.map(movie => movieCard(movie, false, false)).join("");
}

function renderCinemas() {
  const cinemas = cinemaLinkedList.toArray();
  $("#cinemaList").innerHTML = cinemas.map(cinema => `
    <button class="cinema-btn ${cinema.id === activeCinemaId ? "active" : ""}" data-cinema="${cinema.id}">
      ${cinema.name}
    </button>
  `).join("");

  if (!activeCinemaId && cinemas.length) {
    selectCinema(cinemas[0].id);
  }
}

function selectCinema(id) {
  activeCinemaId = id;
  const cinema = cinemaStore.findById(id);
  $("#selectedCinemaTitle").textContent = cinema.name;
  $("#selectedCinemaAddress").textContent = cinema.address;
  const movies = movieStore.getAll().filter(movie => cinema.movieIds.includes(movie.id));
  $("#cinemaMovieGrid").innerHTML = movies.map(movie => movieCard(movie, false, true)).join("");
  $$(".cinema-btn").forEach(button => button.classList.toggle("active", button.dataset.cinema === id));
  activityStack.push(`Melihat jadwal di ${cinema.name}`);
  renderAccount();
}

function foodCard(food) {
  return `
    <article class="food-card">
      <div class="food-image">${food.emoji}</div>
      <div class="food-info">
        <h4>${food.name}</h4>
        <div class="meta">
          <span>${food.category}</span>
          <span>Stok ${food.stock}</span>
          <span>${rupiah(food.price)}</span>
        </div>
        <div class="card-actions">
          <button class="icon-btn red" data-buy-food="${food.id}">Beli</button>
        </div>
      </div>
    </article>
  `;
}

function renderFoods(list = foodStore.getAll()) {
  $("#foodGrid").innerHTML = list.map(foodCard).join("");
}

// ========== ACCOUNT PAGE: MENU STYLE ==========
function renderAccount() {
  $("#accountUsername").textContent = currentUser?.username || "guest";
  $("#accountEmail").textContent = currentUser?.email || "guest@fimax.id";
}

// Account submenu state
let accountSection = null; // null = main menu, 'info' = info akun, 'history' = riwayat

function renderAccountPage() {
  const wrap = $("#accountCard");
  if (!wrap) return;

  if (accountSection === null) {
    wrap.innerHTML = `
      <h2 style="color:var(--red);font-size:32px;font-weight:900;letter-spacing:-1px;margin-bottom:32px;">FIMAX.ID</h2>
      <h3 style="margin-bottom:24px;">Main Menu</h3>
      <div class="account-menu-list">
        <button class="account-menu-btn" data-account-section="info">
          <span class="account-menu-num">1</span>
          <span>Informasi Akun</span>
          <span class="account-menu-arrow">›</span>
        </button>
        <button class="account-menu-btn" data-account-section="history">
          <span class="account-menu-num">2</span>
          <span>Riwayat Pembelian Tiket & Makanan</span>
          <span class="account-menu-arrow">›</span>
        </button>
      </div>
      <button id="logoutBtn" class="btn btn-red" style="margin-top:32px;">Logout</button>
    `;
  } else if (accountSection === 'info') {
    wrap.innerHTML = `
      <button class="back-btn-account" data-account-section="null">← Kembali</button>
      <h2>Informasi Akun</h2>
      <p><strong>Username:</strong> ${currentUser?.username || "guest"}</p>
      <p><strong>Email:</strong> ${currentUser?.email || "guest@fimax.id"}</p>
    `;
  } else if (accountSection === 'history') {
    const ticketRows = userTickets.length
      ? userTickets.map(t => `<li><strong>${t.movie}</strong> – ${t.amount} tiket – ${t.schedule} – ${rupiah(t.total)} – <span style="color:green">${t.status}</span></li>`).join("")
      : "<li>Belum ada pembelian tiket.</li>";
    const foodRows = foodOrders.length
      ? foodOrders.map(o => `<li>${o.name} – ${rupiah(o.price)} – Jadwal: ${o.schedule || '-'}</li>`).join("")
      : "<li>Belum ada pembelian makanan.</li>";
    wrap.innerHTML = `
      <button class="back-btn-account" data-account-section="null">← Kembali</button>
      <h2>Riwayat Pembelian</h2>
      <h3 style="margin-top:20px;">Tiket Film</h3>
      <ul class="clean-list">${ticketRows}</ul>
      <h3 style="margin-top:20px;">Makanan & Minuman</h3>
      <ul class="clean-list">${foodRows}</ul>
    `;
  }
}

// ========== MOVIE DETAIL (film page - no buy button) ==========
function openMovieDetailInfoOnly(id) {
  const movie = movieStore.findById(id);
  if (!movie) return;

  const buyCount = userTickets.filter(t => t.movie === movie.title).reduce((sum, t) => sum + (t.amount || 0), 0);
  const foodBuyCount = foodOrders.filter(o => o.movieId === id).length;

  $("#detailContent").innerHTML = `
    <div class="detail-grid">
      ${makePoster(movie.title, movie.poster)}
      <div>
        <h2>${movie.title}</h2>
        <p><strong>Genre:</strong> ${movie.genre}</p>
        <p><strong>Durasi:</strong> ${movie.duration} menit</p>
        <p><strong>Rating:</strong> ⭐ ${movie.rating}</p>
        <p><strong>Sinopsis:</strong> ${movie.synopsis}</p>
        <p><strong>Total tiket terjual:</strong> ${buyCount} tiket</p>
      </div>
    </div>
  `;
  $("#detailModal").classList.remove("hidden");
  activityStack.push(`Melihat detail film ${movie.title}`);
  renderAccount();
}

// ========== MOVIE DETAIL (cinema / beranda - with buy) ==========
function openMovieDetail(id, cinemaContext) {
  const movie = movieStore.findById(id);
  if (!movie) return;

  const schedules = movie.schedules.map((time, index) => `
    <label class="radio-chip">
      <input type="radio" name="schedule" value="${time}" ${index === 0 ? "checked" : ""}> ${time}
    </label>
  `).join("");

  // Cinema brand buttons
  const cinemaBrands = ["CGV", "XXI", "Cinépolis"];
  const brandBtns = cinemaBrands.map((brand, i) => `
    <button type="button" class="cinema-brand-btn ${i === 0 ? 'selected' : ''}" data-brand="${brand}">${brand}</button>
  `).join("");

  $("#detailContent").innerHTML = `
    <div class="detail-grid">
      ${makePoster(movie.title, movie.poster)}
      <div>
        <p><strong>Judul Film:</strong> ${movie.title}</p>
        <p><strong>Sinopsis:</strong> ${movie.synopsis}</p>
        <p><strong>Genre:</strong> ${movie.genre} • <strong>Durasi:</strong> ${movie.duration} menit • <strong>Rating:</strong> ⭐ ${movie.rating}</p>
        <p><strong>Harga Tiket:</strong> ${rupiah(movie.price)}</p>

        <p><strong>Pilih Bioskop:</strong></p>
        <div class="cinema-brand-row" id="cinemaBrandRow">${brandBtns}</div>

        <p><strong>Jadwal Tayang:</strong></p>
        <div class="schedule-row">${schedules}</div>

        <div class="payment-box">
          <label>Jumlah Tiket</label>
          <input id="ticketAmount" type="number" min="1" max="10" value="1">
          <label>Metode Pembayaran</label>
          <select id="paymentMethod">
            <option>DANA</option>
            <option>OVO</option>
            <option>GoPay</option>
            <option>Transfer Bank</option>
          </select>
          <button class="btn btn-red" data-pay-ticket="${movie.id}">Ke Pemilihan Kursi</button>
        </div>
      </div>
    </div>
  `;
  $("#detailModal").classList.remove("hidden");

  // Cinema brand toggle
  document.querySelectorAll(".cinema-brand-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cinema-brand-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  activityStack.push(`Melihat detail film ${movie.title}`);
  renderAccount();
}

// ========== SEAT SELECTION ==========
const ROWS = ["A", "B", "C", "D", "E", "F"];
const COLS = 15;
const STAIRS = [4, 5, 12, 13]; // 1-indexed columns that are stairs

function buildSeatGrid(takenSeats, selectedSeats) {
  let html = `<div class="seat-legend">
    <span class="seat-demo seat-free"></span> Kosong (dapat dipilih)
    <span class="seat-demo seat-taken"></span> Terisi
    <span class="seat-demo seat-selected"></span> Dipilih
    <span class="seat-demo seat-stair"></span> Tangga
  </div>
  <div class="seat-grid-wrap">
    <div class="seat-screen">▬▬▬ LAYAR ▬▬▬</div>
    <div class="seat-grid">`;

  ROWS.forEach(row => {
    html += `<div class="seat-row"><span class="seat-row-label">${row}</span>`;
    for (let col = 1; col <= COLS; col++) {
      const code = `${row}${col}`;
      const isStair = STAIRS.includes(col);
      if (isStair) {
        html += `<span class="seat seat-stair" title="Tangga"></span>`;
        continue;
      }
      const isTaken = takenSeats.includes(code);
      const isSelected = selectedSeats.includes(code);
      if (isTaken) {
        html += `<span class="seat seat-taken" title="${code}"></span>`;
      } else if (isSelected) {
        html += `<span class="seat seat-selected" data-seat="${code}" title="${code}">${code}</span>`;
      } else {
        html += `<span class="seat seat-free" data-seat="${code}" title="${code}"></span>`;
      }
    }
    html += `</div>`;
  });

  html += `</div></div>`;
  return html;
}

function openSeatSelection(movie, amount, schedule, method, selectedBrand) {
  // Determine cinemaId for seat storage: use activeCinemaId or brand-based
  const cinemaForSeats = activeCinemaId || ("brand_" + selectedBrand);
  const takenSeats = getSeatData(cinemaForSeats, movie.id, schedule);
  const selectedSeats = [];

  seatSelectionState = { movie, amount, schedule, method, selectedBrand, cinemaForSeats, takenSeats, selectedSeats: [] };

  const total = amount * movie.price;

  $("#paymentContent").innerHTML = `
    <h2>Pilih Kursi</h2>
    <p><strong>Film:</strong> ${movie.title} &nbsp;|&nbsp; <strong>Jadwal:</strong> ${schedule} &nbsp;|&nbsp; <strong>Bioskop:</strong> ${selectedBrand}</p>
    <p>Pilih <strong>${amount}</strong> kursi. Sudah dipilih: <span id="seatCountDisplay">0</span></p>
    <div id="seatGridContainer">${buildSeatGrid(takenSeats, [])}</div>
    <div style="margin-top:16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
      <span>Kursi dipilih: <strong id="selectedSeatList">-</strong></span>
      <button class="btn btn-red" id="confirmSeatBtn" disabled>Konfirmasi Kursi & Bayar</button>
    </div>
  `;

  $("#paymentModal").classList.remove("hidden");

  // Seat click events
  document.getElementById("seatGridContainer").addEventListener("click", e => {
    const seat = e.target.dataset.seat;
    if (!seat) return;

    const state = seatSelectionState;
    const idx = state.selectedSeats.indexOf(seat);
    if (idx !== -1) {
      // Deselect
      state.selectedSeats.splice(idx, 1);
    } else {
      if (state.selectedSeats.length >= state.amount) {
        showToast(`Kamu hanya bisa memilih ${state.amount} kursi.`);
        return;
      }
      state.selectedSeats.push(seat);
    }

    document.getElementById("seatCountDisplay").textContent = state.selectedSeats.length;
    document.getElementById("selectedSeatList").textContent = state.selectedSeats.join(", ") || "-";
    document.getElementById("confirmSeatBtn").disabled = state.selectedSeats.length !== state.amount;

    // Re-render grid
    document.getElementById("seatGridContainer").innerHTML = buildSeatGrid(state.takenSeats, state.selectedSeats);
    // Re-attach listener (event delegation stays on container so it's fine – but we replaced innerHTML)
  });

  document.getElementById("confirmSeatBtn").addEventListener("click", () => {
    const state = seatSelectionState;
    // Save seats as taken
    const newTaken = [...state.takenSeats, ...state.selectedSeats];
    saveSeatData(state.cinemaForSeats, state.movie.id, state.schedule, newTaken);
    // Proceed to QR payment
    const total = state.amount * state.movie.price;
    openPaymentQr(state.movie, state.amount, state.schedule, state.method, total, state.selectedSeats.join(", "));
  });
}

// ========== PAYMENT QR ==========
function openPaymentQr(movie, amount, schedule, method, total, seats) {
  const ticketCode = createTicketCode();
  const paymentPayload = {
    code: ticketCode,
    user: currentUser?.username || "Guest",
    email: currentUser?.email || "guest@fimax.id",
    movie: movie.title,
    movieId: movie.id,
    amount,
    schedule,
    method,
    total,
    seats: seats || "",
    createdAt: new Date().toLocaleString("id-ID")
  };

  const qrText = JSON.stringify(paymentPayload);
  $("#paymentContent").innerHTML = `
    <h2>Pembayaran QR</h2>
    <div class="qr-payment-grid">
      <div class="qr-box">
        <img src="${buildQrUrl(qrText)}" alt="QR Pembayaran">
        <p><strong>Scan QR untuk pembayaran</strong></p>
        <small>Kode: ${ticketCode}</small>
      </div>
      <div class="payment-summary">
        <h3>Ringkasan Pembayaran</h3>
        <table>
          <tr><td>Film</td><td>${movie.title}</td></tr>
          <tr><td>Jadwal</td><td>${schedule}</td></tr>
          <tr><td>Jumlah</td><td>${amount} tiket</td></tr>
          ${seats ? `<tr><td>Kursi</td><td>${seats}</td></tr>` : ""}
          <tr><td>Metode</td><td>${method}</td></tr>
          <tr><td>Total</td><td>${rupiah(total)}</td></tr>
        </table>
        <button class="btn btn-red" data-confirm-payment='${encodeURIComponent(JSON.stringify(paymentPayload))}'>Konfirmasi Pembayaran</button>
      </div>
    </div>
  `;

  $("#paymentModal").classList.remove("hidden");
}

function confirmPayment(encodedPayload) {
  const payload = JSON.parse(decodeURIComponent(encodedPayload));
  const ticket = {
    id: payload.code,
    movie: payload.movie,
    movieId: payload.movieId,
    user: payload.user,
    email: payload.email,
    schedule: payload.schedule,
    amount: payload.amount,
    method: payload.method,
    total: payload.total,
    seats: payload.seats,
    createdAt: payload.createdAt,
    status: "LUNAS"
  };

  userTickets.push(ticket);
  lastSelectedTicket = { movieTitle: ticket.movie, schedule: ticket.schedule, movieId: ticket.movieId };
  saveLocalData();
  paymentQueue.enqueue(`${ticket.movie} - ${ticket.amount} tiket - ${ticket.schedule} - ${rupiah(ticket.total)} - LUNAS`);
  activityStack.push(`Pembayaran berhasil untuk ${ticket.movie}`);
  renderSchedule();
  renderAccount();

  $("#paymentContent").innerHTML = receiptTemplate(ticket);
  showToast("Pembayaran berhasil. Bukti pembayaran siap dicetak.");
}

function receiptTemplate(ticket) {
  return `
    <div class="receipt-box">
      <div class="receipt-header">
        <div>
          <div class="receipt-brand">FIMAX.ID</div>
          <strong>Bukti Pembayaran Tiket Bioskop</strong>
        </div>
        <div>
          <div class="receipt-status">${ticket.status}</div>
          <small>${ticket.createdAt}</small>
        </div>
      </div>
      <table class="receipt-table" style="width:100%;border-collapse:collapse">
        <tr><td>Kode Tiket</td><td><strong>${ticket.id}</strong></td></tr>
        <tr><td>Nama</td><td>${ticket.user}</td></tr>
        <tr><td>Email</td><td>${ticket.email}</td></tr>
        <tr><td>Film</td><td>${ticket.movie}</td></tr>
        <tr><td>Jadwal</td><td>${ticket.schedule}</td></tr>
        ${ticket.seats ? `<tr><td>Kursi</td><td>${ticket.seats}</td></tr>` : ""}
        <tr><td>Jumlah Tiket</td><td>${ticket.amount}</td></tr>
        <tr><td>Metode Pembayaran</td><td>${ticket.method}</td></tr>
        <tr><td>Total</td><td><strong>${rupiah(ticket.total)}</strong></td></tr>
      </table>
      <p style="margin-top:20px">Tunjukkan bukti ini saat masuk bioskop. Terima kasih sudah menggunakan FIMAX.ID.</p>
      <button class="btn btn-red" onclick="window.print()">Cetak Bukti Pembayaran</button>
    </div>
  `;
}

function renderSchedule() {
  const wrap = $("#userScheduleList");
  if (!wrap) return;

  if (!userTickets.length) {
    wrap.innerHTML = `
      <div class="ticket-card">
        <h3>Belum ada jadwal film.</h3>
        <p>Pesan tiket dan selesaikan pembayaran QR untuk membuat jadwal otomatis.</p>
      </div>
    `;
    return;
  }

  wrap.innerHTML = userTickets.map(ticket => `
    <article class="ticket-card">
      <h3>${ticket.movie}</h3>
      <p><strong>Nama:</strong> ${ticket.user}</p>
      <p><strong>Jadwal:</strong> ${ticket.schedule}</p>
      ${ticket.seats ? `<p><strong>Kursi:</strong> ${ticket.seats}</p>` : ""}
      <p><strong>Jumlah:</strong> ${ticket.amount} tiket</p>
      <p><strong>Status:</strong> ${ticket.status}</p>
      <p><strong>Total:</strong> ${rupiah(ticket.total)}</p>
      <span class="ticket-code">${ticket.id}</span>
      <button class="btn btn-red btn-small" onclick='$("#paymentContent").innerHTML = receiptTemplate(${JSON.stringify(ticket).replace(/'/g, "&#39;")}); $("#paymentModal").classList.remove("hidden");'>Lihat / Cetak Bukti</button>
    </article>
  `).join("");
}

// ========== FOOD BUY POPUP ==========
function buyFood(id) {
  const food = foodStore.findById(id);
  if (!food) return;
  if (food.stock <= 0) {
    showToast("Stok habis.");
    return;
  }

  // Build schedule options from user tickets
  const scheduleOptions = userTickets.length
    ? userTickets.map((t, i) => `<label class="radio-chip"><input type="radio" name="foodSchedule" value="${i}" ${i === 0 ? "checked" : ""}> ${t.movie} – ${t.schedule}</label>`).join("")
    : null;

  if (!scheduleOptions) {
    // No tickets yet
    $("#paymentContent").innerHTML = `
      <div style="text-align:center;padding:40px 20px;">
        <div style="font-size:48px;margin-bottom:16px;">🎬</div>
        <h2>Belum ada jadwal film yang dipilih</h2>
        <p>Silahkan pilih jadwal film terlebih dahulu!</p>
        <button class="btn btn-red" data-close-payment style="margin-top:16px;">Tutup</button>
      </div>
    `;
    $("#paymentModal").classList.remove("hidden");
    return;
  }

  $("#paymentContent").innerHTML = `
    <div style="padding:8px">
      <h2>Beli ${food.name} ${food.emoji}</h2>
      <p><strong>Harga:</strong> ${rupiah(food.price)}</p>
      <p>Pilih jadwal film untuk pesanan makanan ini:</p>
      <div class="schedule-row" style="margin:14px 0;">${scheduleOptions}</div>
      <button class="btn btn-red" id="confirmFoodBuyBtn" data-food-id="${food.id}">Tambahkan ke Jadwal</button>
    </div>
  `;
  $("#paymentModal").classList.remove("hidden");
}

function confirmFoodBuy(foodId) {
  const food = foodStore.findById(foodId);
  if (!food) return;

  const selectedIndex = document.querySelector("input[name='foodSchedule']:checked");
  if (!selectedIndex) { showToast("Pilih jadwal terlebih dahulu."); return; }

  const ticket = userTickets[parseInt(selectedIndex.value)];
  foodStore.update(foodId, { stock: food.stock - 1 });

  const order = {
    name: food.name,
    price: food.price,
    emoji: food.emoji,
    movieTitle: ticket.movie,
    movieId: ticket.movieId,
    schedule: ticket.schedule,
    createdAt: new Date().toLocaleString("id-ID")
  };
  foodOrders.push(order);
  paymentQueue.enqueue(`${food.name} - ${rupiah(food.price)}`);
  activityStack.push(`Membeli ${food.name} untuk jadwal ${ticket.schedule}`);
  saveLocalData();
  renderFoods();
  renderAccount();

  $("#paymentContent").innerHTML = `
    <div style="text-align:center;padding:40px 20px;">
      <div style="font-size:64px;margin-bottom:16px;">${food.emoji}</div>
      <h2>Berhasil!</h2>
      <p><strong>${food.name}</strong> telah ditambahkan pada jadwal:</p>
      <p style="font-size:20px;color:var(--red);font-weight:800;">${ticket.movie} – ${ticket.schedule}</p>
      <button class="btn btn-red" data-close-payment style="margin-top:20px;">Tutup</button>
    </div>
  `;
}

// ========== SEARCH ==========
function searchGlobal(keyword) {
  if (!keyword.trim()) {
    renderMovies();
    renderFoods();
    return;
  }

  const movies = linearSearch(movieStore.getAll(), keyword);
  const foods = linearSearch(foodStore.getAll(), keyword);

  renderMovies(movies);
  renderFoods(foods);

  const bst = new BinarySearchTree();
  movieStore.getAll().forEach(movie => bst.insert(movie));
  const bstResult = bst.search(keyword);
  if (bstResult) {
    activityStack.push(`BST menemukan film: ${bstResult.title}`);
  }
}

function buildQrUrl(text) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(text)}`;
}

function createTicketCode() {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `FMX-${Date.now().toString().slice(-6)}-${random}`;
}

// ========== EVENT DELEGATION ==========
document.addEventListener("click", event => {
  const target = event.target;

  if (target.matches("[data-open-auth]")) showAuth(target.dataset.openAuth);
  if (target.matches("#backToLanding")) {
    $("#authPage").classList.add("hidden");
    $("#landingPage").classList.remove("hidden");
  }

  if (target.matches("[data-nav]")) showPage(target.dataset.nav);
  if (target.matches("[data-cinema]")) selectCinema(target.dataset.cinema);

  // Film page: info-only detail
  if (target.closest("[data-film-detail]") && !target.matches("button")) {
    const card = target.closest("[data-film-detail]");
    if (card) openMovieDetailInfoOnly(card.dataset.filmDetail);
  }

  // Cinema / beranda: purchase detail
  if (target.matches("[data-detail-movie]")) {
    const cinemaCtx = target.dataset.cinemaContext || activeCinemaId || "";
    openMovieDetail(target.dataset.detailMovie, cinemaCtx);
  }

  if (target.matches("[data-buy-food]")) buyFood(target.dataset.buyFood);

  // Food buy confirm
  if (target.matches("#confirmFoodBuyBtn")) {
    confirmFoodBuy(target.dataset.foodId);
  }

  if (target.matches("[data-close-modal]")) $("#detailModal").classList.add("hidden");
  if (target.matches("[data-close-payment]")) $("#paymentModal").classList.add("hidden");

  if (target.matches("[data-pay-ticket]")) {
    const movie = movieStore.findById(target.dataset.payTicket);
    const amount = Number($("#ticketAmount").value);
    const schedule = document.querySelector("input[name='schedule']:checked")?.value;
    const method = $("#paymentMethod").value;
    const selectedBrand = document.querySelector(".cinema-brand-btn.selected")?.dataset.brand || "CGV";
    $("#detailModal").classList.add("hidden");
    openSeatSelection(movie, amount, schedule, method, selectedBrand);
  }

  if (target.matches("[data-confirm-payment]")) confirmPayment(target.dataset.confirmPayment);
  if (target.matches("#googleLoginBtn")) demoGoogleLogin();
  if (target.matches("#printScheduleBtn")) window.print();

  // Account submenu
  if (target.matches("[data-account-section]")) {
    const val = target.dataset.accountSection;
    accountSection = val === "null" ? null : val;
    renderAccountPage();
  }

  if (target.matches("#logoutBtn")) {
    currentUser = null;
    localStorage.removeItem("fimax_user");
    $("#mainApp").classList.add("hidden");
    $("#landingPage").classList.remove("hidden");
  }
});

$("#authForm").addEventListener("submit", event => {
  event.preventDefault();
  const username = $("#usernameInput").value.trim();
  const email = $("#emailInput").value.trim();
  const password = $("#passwordInput").value.trim();

  if (!username || !email) { showToast("Email dan username wajib diisi."); return; }
  if (authMode === "signup" && password.length < 6) { showToast("Password minimal 6 karakter."); return; }

  currentUser = { username, email };
  localStorage.setItem("fimax_user", JSON.stringify(currentUser));
  activityStack.push(`${authMode === "signup" ? "Membuat akun" : "Login"} sebagai ${username}`);
  showMainApp();
});

$("#globalSearch").addEventListener("input", event => {
  searchGlobal(event.target.value);
});

$("#sortMovieSelect").addEventListener("change", event => {
  const value = event.target.value;
  let list = movieStore.getAll();
  if (value === "title-asc") list = bubbleSort(list, "title", "asc");
  if (value === "rating-desc") list = bubbleSort(list, "rating", "desc");
  if (value === "duration-asc") list = bubbleSort(list, "duration", "asc");
  renderMovies(list);
  activityStack.push(`Sorting film: ${value}`);
  renderAccount();
});

$("#sortFoodSelect").addEventListener("change", event => {
  const value = event.target.value;
  let list = foodStore.getAll();
  if (value === "price-asc") list = bubbleSort(list, "price", "asc");
  if (value === "price-desc") list = bubbleSort(list, "price", "desc");
  if (value === "name-asc") list = bubbleSort(list, "name", "asc");
  renderFoods(list);
  activityStack.push(`Sorting makanan: ${value}`);
  renderAccount();
});



if (currentUser) {
  showMainApp();
} else {
  renderAll();
}

window.addEventListener("load", initGoogleLogin);
