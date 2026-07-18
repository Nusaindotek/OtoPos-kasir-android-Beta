console.log("JS Otopos Mulai Jalan");

// FUNGSI AMAN BUAT BACA LOCALSTORAGE
function getData(key) {
    try {
        const data = localStorage.getItem(key);
        return data? JSON.parse(data) : [];
    } catch(e) {
        console.log("Gagal baca", key);
        return [];
    }
}
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log("Berhasil simpan", key);
    } catch(e) {
        alert("Gagal menyimpan! Memori HP penuh");
    }
}

let produk = getData('produk');
let antrian = getData('antrian');
let cart = [];
let mode = 'servis';
let paymentMethod = 'Tunai';
let settingToko = JSON.parse(localStorage.getItem('settingToko')) || { nama: 'Bengkel HELICOPTER', alamat: 'Majalaya', telp: '0', footer: 'Terima Kasih' };

window.onload = function() {
    loadProduk();
    loadAntrian();
    loadSetting();
    setMode('servis', document.getElementById('tab-servis'));
    updateBilling();
}

function setMode(m, el) {
    mode = m;
    document.querySelectorAll('#tab-servis, #tab-part').forEach(b => { b.classList.remove('bg-red-600', 'text-white'); b.classList.add('text-gray-600'); });
    el.classList.add('bg-red-600', 'text-white');
    document.getElementById('area-servis').style.display = m === 'servis'? 'flex' : 'none';
    document.getElementById('area-part').style.display = m === 'part'? 'flex' : 'none';
    document.getElementById('billing-type').innerText = m === 'servis'? 'SERVIS' : 'PART';
}
function toggleModal(id) { document.getElementById(id).classList.toggle('hidden'); }
function showTab(id, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('border-blue-600', 'text-gray-900'); b.classList.add('text-gray-500'); });
    el.classList.add('border-blue-600', 'text-gray-900');
}

// ANTRIAN - UDAH BISA SAVE
function tambahAntrian() {
    const nopol = document.getElementById('input-nopol-baru').value.toUpperCase();
    const motor = document.getElementById('input-motor-baru').value;
    if (!nopol) return alert('Nopol wajib diisi');
    antrian.push({ id: Date.now(), nopol, motor, waktu: new Date().toLocaleTimeString('id-ID') });
    saveData('antrian', antrian); // <--- INI PENTING
    loadAntrian(); toggleModal('antrian-modal');
    document.getElementById('input-nopol-baru').value = ''; document.getElementById('input-motor-baru').value = '';
}
function loadAntrian() {
    const el = document.getElementById('list-antrian');
    if (antrian.length === 0) { el.innerHTML = '<p class="text-center text-gray-400">Antrian Kosong</p>'; return; }
    el.innerHTML = antrian.map(a => `<div class="p-2 bg-white rounded-lg shadow-sm border mb-2"><p class="font-black">${a.nopol}</p><p class="text-xs text-gray-500">${a.motor}</p></div>`).join('');
}

// PRODUK - UDAH BISA SAVE
function loadProduk() { document.getElementById('list-produk').innerHTML = produk.map(p => `<option value="${p.nama} - Stok:${p.stok}">`).join(''); }
function handleQuickAdd(lagi) {
    const nama = document.getElementById('input-part-name').value;
    const harga = parseInt(document.getElementById('input-part-price').value);
    const stok = parseInt(document.getElementById('input-part-stock').value);
    if (!nama ||!harga) return alert('Nama dan Harga wajib');
    produk.push({ nama, harga, stok });
    saveData('produk', produk); // <--- INI PENTING
    loadProduk();
    if (!lagi) toggleModal('input-modal');
    document.getElementById('input-part-name').value = ''; document.getElementById('input-part-price').value = ''; document.getElementById('input-part-stock').value = '0';
    alert('Data tersimpan');
}

function tambahKeBilling() {
    const searchVal = document.getElementById('input-produk-search').value;
    const qty = parseInt(document.getElementById('input-qty').value);
    const namaProduk = searchVal.split(' - ')[0];
    const p = produk.find(x => x.nama === namaProduk);
    if (!p) return alert('Produk tidak ditemukan');
    if (p.stok < qty) return alert('Stok tidak cukup');
    const existing = cart.find(c => c.nama === p.nama);
    if (existing) existing.qty += qty; else cart.push({...p, qty });
    p.stok -= qty;
    saveData('produk', produk); // <--- STOK IKUT KE SAVE
    document.getElementById('input-produk-search').value = ''; document.getElementById('input-qty').value = 1;
    loadProduk(); updateBilling();
}
function updateBilling() {
    const el = document.getElementById('cart-items');
    const total = cart.reduce((sum, i) => sum + i.harga * i.qty, 0);
    el.innerHTML = cart.length === 0? '<p class="text-center text-slate-500">Keranjang kosong</p>' : cart.map(i => `<div class="flex justify-between text-sm"><span>${i.nama} x${i.qty}</span><span>Rp ${(i.harga * i.qty).toLocaleString('id-ID')}</span></div>`).join('');
    document.getElementById('cart-total').innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

function setPayment(m, el) {
    paymentMethod = m;
    document.querySelectorAll('.btn-pay').forEach(b => { b.classList.remove('border-emerald-500', 'text-emerald-400'); b.classList.add('border-slate-700', 'text-slate-400'); });
    el.classList.add('border-emerald-500', 'text-emerald-400');
}

// SETTING - UDAH BISA SAVE
function simpanSettingToko() {
    settingToko.nama = document.getElementById('setting-nama').value;
    settingToko.alamat = document.getElementById('setting-alamat').value;
    settingToko.telp = document.getElementById('setting-telp').value;
    settingToko.footer = document.getElementById('setting-footer').value;
    localStorage.setItem('settingToko', JSON.stringify(settingToko)); // <--- INI PENTING
    loadSetting(); alert('Setting tersimpan');
}
function loadSetting() {
    document.getElementById('nama-toko-header').innerText = settingToko.nama;
    document.getElementById('setting-nama').value = settingToko.nama;
    document.getElementById('setting-alamat').value = settingToko.alamat;
    document.getElementById('setting-telp').value = settingToko.telp;
    document.getElementById('setting-footer').value = settingToko.footer;
}

// BACKUP - UDAH BISA
function exportBackup() {
    const data = { produk, antrian, settingToko, tanggalBackup: new Date().toLocaleString('id-ID') };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `OtoPos-Backup.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    alert('Backup berhasil di download');
}
function importBackup(event) {
    const file = event.target.files[0]; if (!file) return; const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            produk = data.produk; antrian = data.antrian; settingToko = data.settingToko;
            saveData('produk', produk); saveData('antrian', antrian); localStorage.setItem('settingToko', JSON.stringify(settingToko));
            loadProduk(); loadAntrian(); loadSetting();
            alert('Restore berhasil!');
        } catch (error) { alert('Gagal: File rusak'); }
    };
    reader.readAsText(file);
}

function pilihPrinter() { alert('Fitur Printer'); }
function prosesCheckout() { alert('Checkout ' + paymentMethod); cart = []; updateBilling(); }
function pilihAntrian(id) {}