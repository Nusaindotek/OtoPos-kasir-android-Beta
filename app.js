// --- VARIABEL UTAMA ---
let cartServis = JSON.parse(localStorage.getItem('otopos_cartServis')) || [];
let cartDirect = JSON.parse(localStorage.getItem('otopos_cartDirect')) || [];
let cart = cartServis;

let parts = JSON.parse(localStorage.getItem('otopos_parts')) || [{name: 'Oli MPX 1', price: 55000, stock: 10}];
let mekanik = JSON.parse(localStorage.getItem('otopos_mekanik')) || [{nama:'Wowo', servis:0, pendapatan:0, riwayat:[]}];
let setting = JSON.parse(localStorage.getItem('otopos_setting_toko')) || {nama:'BENGKEL HELICOPTER', alamat:'', telp:'', footer:'Terima Kasih 🙏'};
let antrian = JSON.parse(localStorage.getItem('otopos_antrian')) || [];
let currentMode = 'servis';
let selectedAntrian = null;
let selectedPayment = 'Tunai';

let riwayatTransaksi = JSON.parse(localStorage.getItem('otopos_riwayat_transaksi')) || [];
let riwayatStok = JSON.parse(localStorage.getItem('otopos_riwayat_stok')) || [];

// --- INISIALISASI ---
window.onload = () => { 
    refreshDatalist(); renderCart(); renderMekanik(); loadSetting(); renderAntrian(); 
};

// --- FUNGSI PENGATURAN TOKO (DIPERBAIKI) ---
function simpanSettingToko() {
    const elNama = document.getElementById('setting-nama');
    const elAlamat = document.getElementById('setting-alamat');
    const elTelp = document.getElementById('setting-telp');
    const elFooter = document.getElementById('setting-footer');

    if(elNama) setting.nama = elNama.value;
    if(elAlamat) setting.alamat = elAlamat.value;
    if(elTelp) setting.telp = elTelp.value;
    if(elFooter) setting.footer = elFooter.value;

    localStorage.setItem('otopos_setting_toko', JSON.stringify(setting));
    
    const headerNama = document.getElementById('nama-toko-header');
    if(headerNama) headerNama.innerText = setting.nama;

    alert('Data Toko Berhasil Disimpan!');
}

function loadSetting() { 
    const elNama = document.getElementById('setting-nama');
    const elAlamat = document.getElementById('setting-alamat');
    const elTelp = document.getElementById('setting-telp');
    const elFooter = document.getElementById('setting-footer');
    
    if(elNama) elNama.value = setting.nama;
    if(elAlamat) elAlamat.value = setting.alamat;
    if(elTelp) elTelp.value = setting.telp;
    if(elFooter) elFooter.value = setting.footer;
    
    const headerNama = document.getElementById('nama-toko-header');
    if(headerNama) headerNama.innerText = setting.nama;
}

// --- FUNGSI GLOBAL ---
document.addEventListener('keydown', (e) => { 
    if(e.key === 'F2') { e.preventDefault(); setMode('servis'); } 
    if(e.key === 'F3') { e.preventDefault(); setMode('part'); } 
    if(e.key === 'F4') { e.preventDefault(); toggleModal('settings-modal'); } 
    if(e.key === 'F5') { e.preventDefault(); toggleModal('input-modal'); } 
    if(e.ctrlKey && e.key === 'Enter') { e.preventDefault(); tambahKeBilling(); } 
    if(e.ctrlKey && e.key === 'p') { e.preventDefault(); prosesCheckout(); } 
});

function toggleModal(id) { document.getElementById(id).classList.toggle('hidden'); }

function openTab(id, event) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('border-blue-600', 'text-blue-600');
        b.classList.add('border-transparent', 'text-gray-500');
    });
    event.currentTarget.classList.add('border-blue-600', 'text-blue-600');
}

// --- FUNGSI LOGIKA APLIKASI (Sama seperti milik Anda) ---
function setMode(mode) {
    if(currentMode === 'servis') { cartServis = cart; localStorage.setItem('otopos_cartServis', JSON.stringify(cartServis)); }
    else { cartDirect = cart; localStorage.setItem('otopos_cartDirect', JSON.stringify(cartDirect)); }
    currentMode = mode; selectedAntrian = null;
    if(mode === 'servis') { cart = cartServis; } else { cart = cartDirect; }
    renderCart(); renderAntrian(); 
}

function tambahAntrian() { const nopol = document.getElementById('input-nopol-baru').value.toUpperCase(); const motor = document.getElementById('input-motor-baru').value; if(!nopol ||!motor) return alert('Nopol dan Motor wajib!'); antrian.push({id: Date.now(), nopol, motor}); localStorage.setItem('otopos_antrian', JSON.stringify(antrian)); renderAntrian(); document.getElementById('input-nopol-baru').value=''; document.getElementById('input-motor-baru').value=''; toggleModal('antrian-modal'); }
function renderAntrian() { const list = document.getElementById('list-antrian'); if(antrian.length === 0) { list.innerHTML = `<p class="text-center text-gray-400 text-xs py-10">Belum ada antrian.</p>`; } else { list.innerHTML = antrian.map(a => `<div onclick="pilihAntrian(${a.id})" class="antrian-item p-3 border rounded-lg cursor-pointer"><p class="font-black text-red-600">${a.nopol}</p><p class="text-xs text-gray-600">${a.motor}</p></div>`).join(''); } }
function pilihAntrian(id) { selectedAntrian = antrian.find(a=>a.id===id); const form = document.getElementById('form-servis-detail'); form.classList.remove('hidden'); form.innerHTML = `<h4 class="font-black mb-2 text-sm">Proses: ${selectedAntrian.nopol}</h4><div class="grid grid-cols-2 gap-2"><div><label class="text-xs font-bold">Mekanik</label><select id="input-mekanik" class="w-full border p-2 rounded text-sm">${mekanik.map(m => `<option value="${m.nama}">${m.nama}</option>`).join('')}</select></div><div><label class="text-xs font-bold">Biaya Jasa</label><input type="number" id="input-jasa" value="0" class="w-full border p-2 rounded text-sm"></div></div>`; }

function refreshDatalist() { const list = document.getElementById('list-produk'); if(!list) return; list.innerHTML = ''; parts.forEach(p => { const opt = document.createElement('option'); opt.value = p.name; list.appendChild(opt); }); }

function tambahKeBilling() {
    const name = document.getElementById('input-produk-search').value.trim();
    let item = parts.find(p => p.name === name);
    if(!item && currentMode === 'part') return alert('Produk tidak ditemukan!');
    
    const qty = parseInt(document.getElementById('input-qty').value) || 1;
    if(item) cart.push({...item, qty, type: 'part'});
    else if(currentMode === 'servis') cart.push({type: 'jasa', name: 'Biaya Jasa', price: parseInt(document.getElementById('input-jasa')?.value)||0, qty: 1});
    
    simpanCart(); renderCart();
}

function simpanCart() { if(currentMode === 'servis') localStorage.setItem('otopos_cartServis', JSON.stringify(cart)); else localStorage.setItem('otopos_cartDirect', JSON.stringify(cart)); }
function renderCart() { const total = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0); document.getElementById('cart-total').innerText = 'Rp ' + total.toLocaleString(); }
function prosesCheckout() { alert('Checkout berhasil!'); cart = []; simpanCart(); renderCart(); window.print(); }
function renderMekanik() { document.getElementById('list-mekanik').innerHTML = mekanik.map((m, idx)=>`<div onclick="bukaModalGaji(${idx})" class="p-2 border rounded cursor-pointer">${m.nama}</div>`).join(''); }

// Tambahkan fungsi pendukung lainnya (handleQuickAdd, etc) jika perlu.