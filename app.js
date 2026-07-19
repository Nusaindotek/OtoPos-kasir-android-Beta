let produk = JSON.parse(localStorage.getItem('produk')) || [];
let antrian = JSON.parse(localStorage.getItem('antrian')) || [];
let keranjang = [];
let mode = 'servis';
let caraBayar = 'Tunai';
let setting = JSON.parse(localStorage.getItem('setting')) || { nama: 'Bengkel HELICOPTER', alamat: 'Majalaya' };

window.onload = function() {
    loadProduk();
    loadAntrian();
    tampilkanKeranjang();
    document.getElementById('nama-toko-header').innerText = setting.nama;
    document.getElementById('setting-nama').value = setting.nama;
    document.getElementById('setting-alamat').value = setting.alamat;
    setMode('servis', document.getElementById('btn-servis'));
}

function setMode(m, el) {
    mode = m;
    document.querySelectorAll('#btn-servis, #btn-part').forEach(b => {
        b.classList.remove('bg-red-600', 'text-white');
        b.classList.add('text-gray-500');
    });
    el.classList.add('bg-red-600', 'text-white');
    el.classList.remove('text-gray-500');
    document.getElementById('area-servis').classList.toggle('hidden', m!== 'servis');
    document.getElementById('area-part').classList.toggle('hidden', m!== 'part');
    document.getElementById('billing-mode').innerText = m === 'servis'? 'SERVIS' : 'PART';
}

function bukaModal(id) { document.getElementById(id).classList.remove('hidden'); }
function tutupModal(id) { document.getElementById(id).classList.add('hidden'); }

// ANTRIAN
function tambahAntrian() {
    const nopol = document.getElementById('input-nopol').value.toUpperCase();
    const motor = document.getElementById('input-motor').value;
    if (!nopol) return alert('Nopol wajib');
    antrian.push({ id: Date.now(), nopol, motor });
    localStorage.setItem('antrian', JSON.stringify(antrian));
    loadAntrian();
    tutupModal('modal-antrian');
}
function loadAntrian() {
    const el = document.getElementById('list-antrian');
    if (antrian.length === 0) {
        el.innerHTML = 'Belum ada antrian. Klik + Tambah Antrian';
        el.className = "min-h-[150px] flex items-center justify-center text-gray-400";
        return;
    }
    el.className = "";
    el.innerHTML = antrian.map(a => `<div class="p-2 border-b">${a.nopol} - ${a.motor}</div>`).join('');
}

// PRODUK
function loadProduk() {
    document.getElementById('list-produk').innerHTML = produk.map(p => `<option value="${p.nama} - Stok:${p.stok}">`).join('');
}
function simpanProduk() {
    const nama = document.getElementById('nama-produk').value;
    const harga = parseInt(document.getElementById('harga-produk').value);
    const stok = parseInt(document.getElementById('stok-produk').value);
    if (!nama ||!harga) return alert('Lengkapi data');
    produk.push({ id: Date.now(), nama, harga, stok });
    localStorage.setItem('produk', JSON.stringify(produk));
    loadProduk();
    tutupModal('modal-produk');
    alert('Produk tersimpan');
}

// KERANJANG
document.getElementById('input-produk').addEventListener('change', function() {
    const val = this.value;
    const nama = val.split(' - ')[0];
    const qty = parseInt(document.getElementById('input-qty').value);
    const p = produk.find(x => x.nama === nama);
    if (!p) return;
    if (p.stok < qty) return alert('Stok habis');
    
    const item = keranjang.find(x => x.id === p.id);
    if (item) item.qty += qty; else keranjang.push({...p, qty });
    p.stok -= qty;
    localStorage.setItem('produk', JSON.stringify(produk));
    
    loadProduk();
    tampilkanKeranjang();
    this.value = '';
    document.getElementById('input-qty').value = '1';
});

function tampilkanKeranjang() {
    const total = keranjang.reduce((sum, i) => sum + i.harga * i.qty, 0);
    document.getElementById('total-harga').innerText = `Rp ${total.toLocaleString('id-ID')}`;
    const el = document.getElementById('list-keranjang');
    if (keranjang.length === 0) { el.innerText = 'Keranjang kosong'; return; }
    el.innerHTML = keranjang.map(i => `<div class="flex justify-between"><span>${i.nama} x${i.qty}</span><span>Rp ${(i.harga*i.qty).toLocaleString('id-ID')}</span></div>`).join('');
}

// BAYAR & SETTING
function setBayar(m, el) {
    caraBayar = m;
    document.querySelectorAll('.btn-bayar').forEach(b => {
        b.classList.remove('border-emerald-500', 'text-emerald-400');
        b.classList.add('border-slate-700', 'text-slate-400');
    });
    el.classList.add('border-emerald-500', 'text-emerald-400');
}
function simpanSetting() {
    setting.nama = document.getElementById('setting-nama').value;
    setting.alamat = document.getElementById('setting-alamat').value;
    localStorage.setItem('setting', JSON.stringify(setting));
    document.getElementById('nama-toko-header').innerText = setting.nama;
    alert('Setting tersimpan');
    tutupModal('modal-setting');
}
function checkout() {
    if (keranjang.length === 0) return alert('Keranjang kosong');
    alert(`Checkout ${caraBayar} berhasil Rp ${keranjang.reduce((sum, i) => sum + i.harga * i.qty, 0).toLocaleString('id-ID')}`);
    keranjang = [];
    tampilkanKeranjang();
}