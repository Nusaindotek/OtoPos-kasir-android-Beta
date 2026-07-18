// OTOPOS ANDROID VERSION
// Database di LocalStorage. Gak ada shortcut keyboard

let produk = JSON.parse(localStorage.getItem('produk')) || [];
let antrian = JSON.parse(localStorage.getItem('antrian')) || [];
let cart = [];
let mode = 'servis'; // default
let paymentMethod = 'Tunai';
let settingToko = JSON.parse(localStorage.getItem('settingToko')) || {
    nama: 'Bengkel HELICOPTER',
    alamat: 'Majalaya, Jawa Barat',
    telp: '0812-xxxx-xxxx',
    footer: 'Terima Kasih 🙏'
};

document.addEventListener('DOMContentLoaded', () => {
    loadProduk();
    loadAntrian();
    loadSetting();
    setMode('servis');
    updateBilling();
});

// 1. FUNGSI MODE - TANPA KEYBOARD
function setMode(m) {
    mode = m;
    document.getElementById('tab-servis').classList.toggle('bg-red-600', m === 'servis');
    document.getElementById('tab-servis').classList.toggle('text-white', m === 'servis');
    document.getElementById('tab-part').classList.toggle('bg-red-600', m === 'part');
    document.getElementById('tab-part').classList.toggle('text-white', m === 'part');
    
    document.getElementById('area-servis').classList.toggle('hidden', m !== 'servis');
    document.getElementById('area-part').classList.toggle('hidden', m !== 'part');
    document.getElementById('billing-type').innerText = m === 'servis' ? 'SERVIS' : 'PART';
    document.getElementById('billing-type').classList.toggle('bg-red-900/50', m === 'servis');
    document.getElementById('billing-type').classList.toggle('bg-emerald-900/50', m === 'part');
}

// 2. MODAL GLOBAL
function toggleModal(id) {
    document.getElementById(id).classList.toggle('hidden');
}

// 3. ANTRIAN
function tambahAntrian() {
    const nopol = document.getElementById('input-nopol-baru').value.toUpperCase();
    const motor = document.getElementById('input-motor-baru').value;
    if (!nopol) return alert('Nopol wajib diisi');
    
    antrian.push({ id: Date.now(), nopol, motor, waktu: new Date().toLocaleTimeString('id-ID') });
    localStorage.setItem('antrian', JSON.stringify(antrian));
    loadAntrian();
    toggleModal('antrian-modal');
    document.getElementById('input-nopol-baru').value = '';
    document.getElementById('input-motor-baru').value = '';
}

function loadAntrian() {
    const el = document.getElementById('list-antrian');
    if (antrian.length === 0) {
        el.innerHTML = '<p class="text-center text-gray-400 text-sm pt-10">Belum ada antrian. Klik + Tambah</p>';
        return;
    }
    el.innerHTML = antrian.map(a => `
        <div onclick="pilihAntrian(${a.id})" class="p-2 bg-white rounded-lg shadow-sm border flex justify-between items-center btn-press">
            <div>
                <p class="font-black">${a.nopol}</p>
                <p class="text-xs text-gray-500">${a.motor} - ${a.waktu}</p>
            </div>
            <button onclick="event.stopPropagation(); hapusAntrian(${a.id})" class="text-red-500 text-xs">Hapus</button>
        </div>
    `).join('');
}

function hapusAntrian(id) {
    antrian = antrian.filter(a => a.id !== id);
    localStorage.setItem('antrian', JSON.stringify(antrian));
    loadAntrian();
}

function pilihAntrian(id) {
    const a = antrian.find(x => x.id === id);
    document.getElementById('form-servis-detail').innerHTML = `
        <p class="font-bold">Sedang Kerjakan: ${a.nopol} - ${a.motor}</p>
    `;
    document.getElementById('form-servis-detail').classList.remove('hidden');
}

// 4. PRODUK & CART
function loadProduk() {
    const datalist = document.getElementById('list-produk');
    datalist.innerHTML = produk.map(p => `<option value="${p.nama} - Stok:${p.stok}">`).join('');
}

function tambahKeBilling() {
    const searchVal = document.getElementById('input-produk-search').value;
    const qty = parseInt(document.getElementById('input-qty').value);
    const namaProduk = searchVal.split(' - ')[0];
    const p = produk.find(x => x.nama === namaProduk);
    
    if (!p) return alert('Produk tidak ditemukan');
    if (p.stok < qty) return alert('Stok tidak cukup');

    const existing = cart.find(c => c.nama === p.nama);
    if (existing) existing.qty += qty;
    else cart.push({ ...p, qty });

    p.stok -= qty;
    localStorage.setItem('produk', JSON.stringify(produk));
    document.getElementById('input-produk-search').value = '';
    document.getElementById('input-qty').value = 1;
    loadProduk();
    updateBilling();
}

function updateBilling() {
    const el = document.getElementById('cart-items');
    const total = cart.reduce((sum, i) => sum + i.harga * i.qty, 0);
    
    if (cart.length === 0) {
        el.innerHTML = '<p class="text-center text-slate-500">Keranjang kosong</p>';
    } else {
        el.innerHTML = cart.map(i => `
            <div class="flex justify-between text-sm">
                <span>${i.nama} x${i.qty}</span>
                <span>Rp ${(i.harga * i.qty).toLocaleString('id-ID')}</span>
            </div>
        `).join('');
    }
    document.getElementById('cart-total').innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

// 5. PAYMENT & CHECKOUT
function setPayment(m) {
    paymentMethod = m;
    document.querySelectorAll('.btn-pay').forEach(b => b.classList.remove('border-emerald-500', 'text-emerald-400'));
    event.target.classList.add('border-emerald-500', 'text-emerald-400');
}

function prosesCheckout() {
    if (cart.length === 0) return alert('Keranjang kosong');
    alert(`Checkout ${paymentMethod} berhasil. Total: ${document.getElementById('cart-total').innerText}`);
    // disini nanti panggil fungsi print
    cart = [];
    updateBilling();
}

// 6. SETTING TOKO
function simpanSettingToko() {
    settingToko.nama = document.getElementById('setting-nama').value;
    settingToko.alamat = document.getElementById('setting-alamat').value;
    settingToko.telp = document.getElementById('setting-telp').value;
    settingToko.footer = document.getElementById('setting-footer').value;
    localStorage.setItem('settingToko', JSON.stringify(settingToko));
    loadSetting();
    alert('Setting tersimpan');
}

function loadSetting() {
    document.getElementById('nama-toko-header').innerText = settingToko.nama;
}

// 7. INPUT PART CEPAT
function handleQuickAdd(lagi) {
    const nama = document.getElementById('input-part-name').value;
    const harga = parseInt(document.getElementById('input-part-price').value);
    const stok = parseInt(document.getElementById('input-part-stock').value);
    if (!nama || !harga) return alert('Nama dan Harga wajib');
    
    produk.push({ nama, harga, stok });
    localStorage.setItem('produk', JSON.stringify(produk));
    loadProduk();
    if (!lagi) toggleModal('input-modal');
    document.getElementById('input-part-name').value = '';
    document.getElementById('input-part-price').value = '';
}