// DATA UTAMA
let produk = [];
let keranjang = [];
let setting = { nama: 'OtoPos', alamat: 'Majalaya' };

// LOAD & SAVE
function loadData() {
    produk = JSON.parse(localStorage.getItem('produk')) || [];
    setting = JSON.parse(localStorage.getItem('setting')) || { nama: 'OtoPos', alamat: 'Majalaya' };
}
function saveData() {
    localStorage.setItem('produk', JSON.stringify(produk));
    localStorage.setItem('setting', JSON.stringify(setting));
}

// SAAT BUKA
window.onload = function() {
    loadData();
    tampilkanProduk();
    tampilkanKeranjang();
    document.getElementById('nama-toko').innerText = setting.nama;
    document.getElementById('setting-nama').value = setting.nama;
    document.getElementById('setting-alamat').value = setting.alamat;
}

// MODAL
function bukaModal(id) { document.getElementById(id).classList.remove('hidden'); }
function tutupModal(id) { document.getElementById(id).classList.add('hidden'); }

// PRODUK
function simpanProduk() {
    const nama = document.getElementById('nama-produk').value.trim();
    const harga = parseInt(document.getElementById('harga-produk').value);
    const stok = parseInt(document.getElementById('stok-produk').value);
    if (!nama ||!harga) return alert('Nama dan Harga wajib diisi');

    produk.push({ id: Date.now(), nama, harga, stok });
    saveData();
    tampilkanProduk();
    tutupModal('modal-produk');
    alert('Produk berhasil disimpan');

    document.getElementById('nama-produk').value = '';
    document.getElementById('harga-produk').value = '';
    document.getElementById('stok-produk').value = '0';
}

function tampilkanProduk() {
    document.getElementById('list-produk').innerHTML = produk.map(p => `<option value="${p.nama}">`).join('');

    if (produk.length === 0) {
        document.getElementById('list-produk-tampil').innerHTML = '<p style="color:gray">Belum ada produk</p>';
        return;
    }
    document.getElementById('list-produk-tampil').innerHTML = produk.map(p => `
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:8px 0;">
            <div>
                <p style="font-weight:bold">${p.nama}</p>
                <p style="font-size:12px; color:gray">Stok: ${p.stok} | Rp ${p.harga.toLocaleString('id-ID')}</p>
            </div>
        </div>
    `).join('');
}

// KERANJANG
function tambahKeranjang() {
    const nama = document.getElementById('input-produk').value;
    const qty = parseInt(document.getElementById('input-qty').value);
    const p = produk.find(x => x.nama === nama);

    if (!p) return alert('Produk tidak ditemukan');
    if (p.stok < qty) return alert('Stok tidak cukup');

    const item = keranjang.find(x => x.id === p.id);
    if (item) item.qty += qty;
    else keranjang.push({...p, qty });

    p.stok -= qty;
    saveData();
    tampilkanProduk();
    tampilkanKeranjang();

    document.getElementById('input-produk').value = '';
    document.getElementById('input-qty').value = '1';
}

function tampilkanKeranjang() {
    const total = keranjang.reduce((sum, item) => sum + item.harga * item.qty, 0);
    document.getElementById('total-harga').innerText = `Rp ${total.toLocaleString('id-ID')}`;

    if (keranjang.length === 0) {
        document.getElementById('list-keranjang').innerHTML = '<p style="color:gray">Keranjang kosong</p>';
        return;
    }
    document.getElementById('list-keranjang').innerHTML = keranjang.map(item => `
        <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:4px;">
            <span>${item.nama} x${item.qty}</span>
            <span>Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</span>
        </div>
    `).join('');
}

// SETTING
function simpanSetting() {
    setting.nama = document.getElementById('setting-nama').value;
    setting.alamat = document.getElementById('setting-alamat').value;
    saveData();
    document.getElementById('nama-toko').innerText = setting.nama;
    alert('Setting tersimpan');
    tutupModal('modal-setting');
}

// BACKUP & RESTORE
function exportData() {
    const data = { produk, setting, tanggal: new Date().toLocaleString('id-ID') };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'backup-otopos.json';
    a.click();
    alert('Backup berhasil di download');
}

function importData() {
    document.getElementById('input-file').click();
}
function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            produk = data.produk || [];
            setting = data.setting || setting;
            saveData();
            window.location.reload();
            alert('Restore berhasil');
        } catch { alert('File rusak'); }
    };
    reader.readAsText(file);
}

// CHECKOUT
function checkout() {
    if (keranjang.length === 0) return alert('Keranjang kosong');
    const total = keranjang.reduce((sum, item) => sum + item.harga * item.qty, 0);
    alert('Transaksi Rp ' + total.toLocaleString('id-ID') + ' berhasil');
    keranjang = [];
    tampilkanKeranjang();
}