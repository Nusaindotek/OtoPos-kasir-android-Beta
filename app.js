let produk = JSON.parse(localStorage.getItem('produk')) || [];
let antrian = JSON.parse(localStorage.getItem('antrian')) || [];
let cart = [];
let mode = 'servis';
let paymentMethod = 'Tunai';
let settingToko = JSON.parse(localStorage.getItem('settingToko')) || {
    nama: 'Bengkel HELICOPTER', alamat: 'Majalaya', telp: '0812', footer: 'Terima Kasih 🙏'
};

document.addEventListener('DOMContentLoaded', () => {
    loadProduk(); loadAntrian(); loadSetting(); setMode('servis'); updateBilling();
});

// MODE
function setMode(m) {
    mode = m;
    document.getElementById('tab-servis').classList.toggle('bg-red-600', m === 'servis');
    document.getElementById('tab-servis').classList.toggle('text-white', m === 'servis');
    document.getElementById('tab-part').classList.toggle('bg-red-600', m === 'part');
    document.getElementById('tab-part').classList.toggle('text-white', m === 'part');
    document.getElementById('area-servis').classList.toggle('hidden', m!== 'servis');
    document.getElementById('area-part').classList.toggle('hidden', m!== 'part');
    document.getElementById('billing-type').innerText = m === 'servis'? 'SERVIS' : 'PART';
}

// MODAL & TAB
function toggleModal(id) { document.getElementById(id).classList.toggle('hidden'); }
function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('border-blue-600'));
    event.target.classList.add('border-blue-600');
}

// ANTRIAN
function tambahAntrian() {
    const nopol = document.getElementById('input-nopol-baru').value.toUpperCase();
    const motor = document.getElementById('input-motor-baru').value;
    if (!nopol) return alert('Nopol wajib diisi');
    antrian.push({ id: Date.now(), nopol, motor, waktu: new Date().toLocaleTimeString('id-ID') });
    localStorage.setItem('antrian', JSON.stringify(antrian));
    loadAntrian(); toggleModal('antrian-modal');
    document.getElementById('input-nopol-baru').value = ''; document.getElementById('input-motor-baru').value = '';
}
function loadAntrian() {
    const el = document.getElementById('list-antrian');
    if (antrian.length === 0) { el.innerHTML = '<p class="text-center text-gray-400 text-sm pt-10">Belum ada antrian</p>'; return; }
    el.innerHTML = antrian.map(a => `<div onclick="pilihAntrian(${a.id})" class="p-2 bg-white rounded-lg shadow-sm border mb-2"><p class="font-black">${a.nopol}</p><p class="text-xs text-gray-500">${a.motor}</p></div>`).join('');
}
function pilihAntrian(id) {
    const a = antrian.find(x => x.id === id);
    document.getElementById('form-servis-detail').innerHTML = `<p class="font-bold">Kerjakan: ${a.nopol}</p>`;
    document.getElementById('form-servis-detail').classList.remove('hidden');
}

// PRODUK & CART
function loadProduk() {
    document.getElementById('list-produk').innerHTML = produk.map(p => `<option value="${p.nama} - Stok:${p.stok}">`).join('');
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
    p.stok -= qty; localStorage.setItem('produk', JSON.stringify(produk));
    document.getElementById('input-produk-search').value = ''; document.getElementById('input-qty').value = 1;
    loadProduk(); updateBilling();
}
function updateBilling() {
    const el = document.getElementById('cart-items');
    const total = cart.reduce((sum, i) => sum + i.harga * i.qty, 0);
    el.innerHTML = cart.length === 0? '<p class="text-center text-slate-500">Keranjang kosong</p>' : cart.map(i => `<div class="flex justify-between text-sm"><span>${i.nama} x${i.qty}</span><span>Rp ${(i.harga * i.qty).toLocaleString('id-ID')}</span></div>`).join('');
    document.getElementById('cart-total').innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

// PAYMENT & CHECKOUT
function setPayment(m) {
    paymentMethod = m;
    document.querySelectorAll('.btn-pay').forEach(b => b.classList.remove('border-emerald-500', 'text-emerald-400'));
    event.target.classList.add('border-emerald-500', 'text-emerald-400');
}
function prosesCheckout() {
    if (cart.length === 0) return alert('Keranjang kosong');
    alert(`Checkout ${paymentMethod} berhasil. Total: ${document.getElementById('cart-total').innerText}`);
    cart = []; updateBilling();
}

// SETTING TOKO
function simpanSettingToko() {
    settingToko.nama = document.getElementById('setting-nama').value;
    settingToko.alamat = document.getElementById('setting-alamat').value;
    settingToko.telp = document.getElementById('setting-telp').value;
    settingToko.footer = document.getElementById('setting-footer').value;
    localStorage.setItem('settingToko', JSON.stringify(settingToko));
    loadSetting(); alert('Setting tersimpan');
}
function loadSetting() {
    document.getElementById('nama-toko-header').innerText = settingToko.nama;
    document.getElementById('setting-nama').value = settingToko.nama;
    document.getElementById('setting-alamat').value = settingToko.alamat;
    document.getElementById('setting-telp').value = settingToko.telp;
    document.getElementById('setting-footer').value = settingToko.footer;
}

// INPUT PART
function handleQuickAdd(lagi) {
    const nama = document.getElementById('input-part-name').value;
    const harga = parseInt(document.getElementById('input-part-price').value);
    const stok = parseInt(document.getElementById('input-part-stock').value);
    if (!nama ||!harga) return alert('Nama dan Harga wajib');
    produk.push({ nama, harga, stok });
    localStorage.setItem('produk', JSON.stringify(produk));
    loadProduk();
    if (!lagi) toggleModal('input-modal');
    document.getElementById('input-part-name').value = ''; document.getElementById('input-part-price').value = '';
}

// BACKUP RESTORE PWA
function exportBackup() {
    const data = { produk, antrian, settingToko, tanggalBackup: new Date().toLocaleString('id-ID') };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `OtoPos-Backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    alert('Backup berhasil di download');
}
function importBackup(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.produk ||!data.settingToko) throw new Error('File backup tidak valid');
            if (!confirm(`Restore data dari ${data.tanggalBackup}? Data saat ini tertimpa.`)) return;
            localStorage.setItem('produk', JSON.stringify(data.produk));
            localStorage.setItem('antrian', JSON.stringify(data.antrian));
            localStorage.setItem('settingToko', JSON.stringify(data.settingToko));
            loadProduk(); loadAntrian(); loadSetting(); updateBilling();
            document.getElementById('import-status').innerText = `Restore berhasil!`; document.getElementById('import-status').classList.add('text-emerald-600');
        } catch (error) {
            document.getElementById('import-status').innerText = 'Gagal: File rusak'; document.getElementById('import-status').classList.add('text-red-600');
        }
    };
    reader.readAsText(file);
}