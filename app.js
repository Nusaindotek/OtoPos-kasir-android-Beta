let produk = JSON.parse(localStorage.getItem('produk')) || [];
let antrian = JSON.parse(localStorage.getItem('antrian')) || [];
let mekanik = JSON.parse(localStorage.getItem('mekanik')) || [];
let keranjang = [];
let mode = 'servis'; // 'servis' atau 'part'
let setting = JSON.parse(localStorage.getItem('setting')) || { nama: 'OTOPOS', alamat: '' };

function init(){
    loadProduk();
    loadAntrian();
    loadMekanik();
    loadPart();
    tampilkanKeranjang();
    setMode('servis');
    document.getElementById('setting-nama').value = setting.nama;
    document.getElementById('setting-alamat').value = setting.alamat;
}

// ================== GLOBAL ==================
function bukaModal(id){
    document.getElementById(id).classList.remove('hidden');
}
function tutupModal(id){
    document.getElementById(id).classList.add('hidden');
}
function showTab(id, el){
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-active'));
    el.classList.add('tab-active');
}

// ================== MODE KASIR ==================
function setMode(m){
    mode = m;
    if(m === 'servis'){
        document.getElementById('btn-servis').className = 'btn btn-green';
        document.getElementById('btn-part').className = 'btn btn-gray';
        document.getElementById('area-servis').classList.remove('hidden');
        document.getElementById('judul-input').innerText = 'TAMBAH KE BILLING SERVIS';
        document.getElementById('mode-label').innerText = 'SERVIS';
        document.getElementById('mode-label').style.background = '#ef4444';
    } else {
        document.getElementById('btn-servis').className = 'btn btn-gray';
        document.getElementById('btn-part').className = 'btn btn-orange';
        document.getElementById('area-servis').classList.add('hidden');
        document.getElementById('judul-input').innerText = 'TAMBAH KE BILLING DIRECT PART';
        document.getElementById('mode-label').innerText = 'PART';
        document.getElementById('mode-label').style.background = '#16a34a';
        keranjang = [];
        tampilkanKeranjang(); // reset pas ganti mode
    }
}

// ================== KASIR: PRODUK & KERANJANG ==================
function loadProduk(){
    document.getElementById('list-produk').innerHTML = produk.map(p => `<option value="${p.nama}">`).join('');
}

function tambahKeKeranjang(){
    const nama = document.getElementById('input-produk').value.trim();
    const qty = parseInt(document.getElementById('input-qty').value) || 1;
    const p = produk.find(x => x.nama === nama);
    if (!p) return alert('Produk tidak ditemukan');
    if(p.stok < qty) return alert('Stok tidak cukup. Sisa: ' + p.stok);

    const item = keranjang.find(x => x.id === p.id);
    if (item) item.qty += qty;
    else keranjang.push({...p, qty });

    tampilkanKeranjang();
    document.getElementById('input-produk').value = '';
    document.getElementById('input-qty').value = '1';
}

function tampilkanKeranjang(){
    const total = keranjang.reduce((sum, i) => sum + i.harga * i.qty, 0);
    document.getElementById('total-harga').innerText = `Rp ${total.toLocaleString('id-ID')}`;
    const el = document.getElementById('list-keranjang');
    if (keranjang.length === 0) { el.innerText = 'Keranjang kosong'; return; }
    el.innerHTML = keranjang.map(i => `
        <div class="item-keranjang">
            <span>${i.nama} x${i.qty}</span>
            <div>
                <span>Rp ${(i.harga*i.qty).toLocaleString('id-ID')} </span>
                <button onclick="hapusKeranjang(${i.id})">X</button>
            </div>
        </div>
    `).join('');
}

function hapusKeranjang(id){
    keranjang = keranjang.filter(i => i.id!== id);
    tampilkanKeranjang();
}

// ================== KASIR: ANTRIAN ==================
function tambahAntrian(){
    const nopol = document.getElementById('input-nopol').value.toUpperCase().trim();
    const motor = document.getElementById('input-motor').value.trim();
    if (!nopol) return alert('Nopol wajib diisi');
    antrian.push({ id: Date.now(), nopol, motor });
    localStorage.setItem('antrian', JSON.stringify(antrian));
    loadAntrian();
    tutupModal('modal-antrian');
    document.getElementById('input-nopol').value = '';
    document.getElementById('input-motor').value = '';
}

function loadAntrian(){
    const el = document.getElementById('list-antrian');
    if (antrian.length === 0) { el.innerHTML = 'Belum ada antrian'; return; }
    el.innerHTML = antrian.map(a => `
        <div class="item-keranjang">
            <span>${a.nopol} - ${a.motor}</span>
            <button onclick="hapusAntrian(${a.id})">Selesai</button>
        </div>
    `).join('');
}

function hapusAntrian(id){
    antrian = antrian.filter(a => a.id!== id);
    localStorage.setItem('antrian', JSON.stringify(antrian));
    loadAntrian();
}

// ================== SETTING: DATA PART ==================
function simpanProduk(){
    const nama = document.getElementById('nama-produk').value.trim();
    const harga = parseInt(document.getElementById('harga-produk').value);
    const stok = parseInt(document.getElementById('stok-produk').value) || 0;
    if (!nama ||!harga) return alert('Lengkapi Nama dan Harga');
    if(produk.find(p => p.nama.toLowerCase() === nama.toLowerCase())) return alert('Nama part sudah ada');

    produk.push({ id: Date.now(), nama, harga, stok });
    localStorage.setItem('produk', JSON.stringify(produk));
    loadProduk();
    loadPart();
    document.getElementById('nama-produk').value = '';
    document.getElementById('harga-produk').value = '';
    document.getElementById('stok-produk').value = '0';
    alert('Part berhasil disimpan');
}

function loadPart(){
    const el = document.getElementById('list-part');
    if (produk.length === 0) { el.innerHTML = 'Belum ada part'; return; }
    el.innerHTML = produk.map(p => `
        <div class="item-keranjang">
            <span>${p.nama}</span>
            <span>Stok:${p.stok} | Rp ${p.harga.toLocaleString('id-ID')}</span>
        </div>
    `).join('');
}

// ================== SETTING: DATA MEKANIK ==================
function simpanMekanik(){
    const nama = document.getElementById('nama-mekanik').value.trim();
    if (!nama) return alert('Nama wajib diisi');
    if(mekanik.find(m => m.nama.toLowerCase() === nama.toLowerCase())) return alert('Nama mekanik sudah ada');
    mekanik.push({ id: Date.now(), nama, gaji: 0 });
    localStorage.setItem('mekanik', JSON.stringify(mekanik));
    loadMekanik();
    document.getElementById('nama-mekanik').value = '';
    alert('Mekanik berhasil disimpan');
}

function loadMekanik(){
    const el = document.getElementById('list-mekanik');
    if (mekanik.length === 0) { el.innerHTML = 'Belum ada data'; return; }
    el.innerHTML = mekanik.map(m => `
        <div class="item-keranjang">
            <span>${m.nama}</span>
            <span>Rp ${m.gaji.toLocaleString('id-ID')}</span>
        </div>
    `).join('');
}

// ================== SETTING: DATA TOKO & BACKUP ==================
function simpanSetting(){
    setting.nama = document.getElementById('setting-nama').value;
    setting.alamat = document.getElementById('setting-alamat').value;
    localStorage.setItem('setting', JSON.stringify(setting));
    alert('Setting tersimpan');
}

function exportData(){
    const data = { produk, antrian, mekanik, setting };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup_otopos_' + new Date().getTime() + '.json';
    a.click();
}

function handleImport(event){
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e){
        try {
            const data = JSON.parse(e.target.result);
            produk = data.produk || [];
            antrian = data.antrian || [];
            mekanik = data.mekanik || [];
            setting = data.setting || setting;
            localStorage.setItem('produk', JSON.stringify(produk));
            localStorage.setItem('antrian', JSON.stringify(antrian));
            localStorage.setItem('mekanik', JSON.stringify(mekanik));
            localStorage.setItem('setting', JSON.stringify(setting));
            alert('Import berhasil. Halaman akan di reload');
            location.reload();
        } catch(err) {
            alert('File backup tidak valid');
        }
    };
    reader.readAsText(file);
}

// ================== KASIR: CHECKOUT ==================
function checkout(){
    if(keranjang.length === 0) return alert('Keranjang kosong');
    const total = keranjang.reduce((sum, i) => sum + i.harga * i.qty, 0);
    alert(`Mode: ${mode.toUpperCase()}\n\nCheckout Sukses\nTotal: Rp ${total.toLocaleString('id-ID')}`);

    // Kurangi stok
    keranjang.forEach(item => {
        const p = produk.find(x => x.id === item.id);
        if(p) p.stok -= item.qty;
    });
    localStorage.setItem('produk', JSON.stringify(produk));
    loadProduk();
    loadPart(); // update stok di tab setting juga

    keranjang = [];
    tampilkanKeranjang();
}

// JALANKAN PERTAMA KALI
init();