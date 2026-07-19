let produk = JSON.parse(localStorage.getItem('produk')) || [];
let antrian = JSON.parse(localStorage.getItem('antrian')) || [];
let mekanik = JSON.parse(localStorage.getItem('mekanik')) || [];
let keranjang = [];
let mode = 'servis';
let setting = JSON.parse(localStorage.getItem('setting')) || { nama: 'OTOPOS', alamat: '' };
let antrianAktif = null;

function init(){
    loadProduk(); loadAntrian(); loadMekanik(); loadPart(); loadMekanikToSelect();
    tampilkanKeranjang(); setMode('servis');
    document.getElementById('setting-nama').value = setting.nama;
    document.getElementById('setting-alamat').value = setting.alamat;
}

// GLOBAL
function bukaModal(id){ document.getElementById(id).classList.remove('hidden'); }
function tutupModal(id){ document.getElementById(id).classList.add('hidden'); antrianAktif = null; }
function showTab(id, el){
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-active'));
    el.classList.add('tab-active');
}

// MODE
function setMode(m){
    mode = m;
    if(m === 'servis'){
        document.getElementById('btn-servis').className = 'btn btn-green';
        document.getElementById('btn-part').className = 'btn btn-gray';
        document.getElementById('area-servis').classList.remove('hidden');
        document.getElementById('area-jasa').style.display = 'block';
        document.getElementById('judul-input').innerText = 'TAMBAH KE BILLING SERVIS';
        document.getElementById('mode-label').innerText = 'SERVIS';
        document.getElementById('mode-label').style.background = '#ef4444';
    } else {
        document.getElementById('btn-servis').className = 'btn btn-gray';
        document.getElementById('btn-part').className = 'btn btn-orange';
        document.getElementById('area-servis').classList.add('hidden');
        document.getElementById('area-jasa').style.display = 'none';
        document.getElementById('judul-input').innerText = 'TAMBAH KE BILLING DIRECT PART';
        document.getElementById('mode-label').innerText = 'PART';
        document.getElementById('mode-label').style.background = '#16a34a';
        keranjang = []; tampilkanKeranjang();
    }
}

// KERANJANG
function loadProduk(){ document.getElementById('list-produk').innerHTML = produk.map(p => `<option value="${p.nama}">`).join(''); }
function tambahKeKeranjang(){
    const nama = document.getElementById('input-produk').value.trim();
    const qty = parseInt(document.getElementById('input-qty').value) || 1;
    const p = produk.find(x => x.nama === nama);
    if (!p) return alert('Produk tidak ditemukan');
    if(p.stok < qty) return alert('Stok tidak cukup. Sisa: ' + p.stok);
    const item = keranjang.find(x => x.id === p.id);
    if (item) item.qty += qty; else keranjang.push({...p, qty, tipe: 'part' });
    tampilkanKeranjang(); document.getElementById('input-produk').value = '';
}
function tambahJasaKeKeranjang(){
    const nama = document.getElementById('input-jasa').value.trim();
    const harga = parseInt(document.getElementById('harga-jasa').value) || 0;
    if(!nama || !harga) return alert('Lengkapi Nama Jasa dan Harga');
    keranjang.push({ id: Date.now(), nama, harga, qty: 1, tipe: 'jasa' });
    tampilkanKeranjang(); document.getElementById('input-jasa').value = ''; document.getElementById('harga-jasa').value = '';
}
function tampilkanKeranjang(){
    const total = keranjang.reduce((sum, i) => sum + i.harga * i.qty, 0);
    document.getElementById('total-harga').innerText = `Rp ${total.toLocaleString('id-ID')}`;
    const el = document.getElementById('list-keranjang');
    if (keranjang.length === 0) { el.innerText = 'Keranjang kosong'; return; }
    el.innerHTML = keranjang.map(i => `<div class="item-keranjang"><span>${i.nama} ${i.tipe === 'jasa' ? '' : 'x'+i.qty}</span><div><span>Rp ${(i.harga*i.qty).toLocaleString('id-ID')} </span><button onclick="hapusKeranjang(${i.id})">X</button></div></div>`).join('');
}
function hapusKeranjang(id){ keranjang = keranjang.filter(i => i.id!== id); tampilkanKeranjang(); }

// ANTRIAN + DETAIL
function tambahAntrian(){
    const nopol = document.getElementById('input-nopol').value.toUpperCase().trim();
    const motor = document.getElementById('input-motor').value.trim();
    if (!nopol) return alert('Nopol wajib diisi');
    antrian.push({ id: Date.now(), nopol, motor, mekanikId: null, keluhan: '', jasa: [], part: [] });
    localStorage.setItem('antrian', JSON.stringify(antrian));
    loadAntrian(); tutupModal('modal-antrian');
    document.getElementById('input-nopol').value = ''; document.getElementById('input-motor').value = '';
}
function loadAntrian(){
    const el = document.getElementById('list-antrian');
    if (antrian.length === 0) { el.innerHTML = 'Belum ada antrian'; return; }
    el.innerHTML = antrian.map(a => `<div class="item-keranjang" style="cursor:pointer" onclick="bukaDetailAntrian(${a.id})"><span><b>${a.nopol}</b> - ${a.motor}</span><button onclick="event.stopPropagation(); hapusAntrian(${a.id})">Selesai</button></div>`).join('');
}
function hapusAntrian(id){ antrian = antrian.filter(a => a.id!== id); localStorage.setItem('antrian', JSON.stringify(antrian)); loadAntrian(); }

function bukaDetailAntrian(id){
    antrianAktif = antrian.find(a => a.id === id);
    if(!antrianAktif) return;
    document.getElementById('detail-nopol').innerText = antrianAktif.nopol;
    document.getElementById('detail-motor').innerText = antrianAktif.motor;
    document.getElementById('select-mekanik').value = antrianAktif.mekanikId || '';
    document.getElementById('input-keluhan').value = antrianAktif.keluhan || '';
    loadDetailJasa(); loadDetailPart(); bukaModal('modal-detail-servis');
}
function simpanDetailServis(){
    if(!antrianAktif) return;
    antrianAktif.mekanikId = parseInt(document.getElementById('select-mekanik').value) || null;
    antrianAktif.keluhan = document.getElementById('input-keluhan').value;
    localStorage.setItem('antrian', JSON.stringify(antrian)); loadAntrian(); alert('Data servis tersimpan');
}
function loadMekanikToSelect(){
    const el = document.getElementById('select-mekanik');
    el.innerHTML = '<option value="">- Pilih Mekanik -</option>' + mekanik.map(m => `<option value="${m.id}">${m.nama}</option>`).join('');
}
function tambahJasaToAntrian(){
    if(!antrianAktif) return;
    const nama = document.getElementById('jasa-nama').value; const harga = parseInt(document.getElementById('jasa-harga').value);
    if(!nama || !harga) return alert('Lengkapi data jasa');
    antrianAktif.jasa.push({id: Date.now(), nama, harga});
    localStorage.setItem('antrian', JSON.stringify(antrian)); loadDetailJasa();
    document.getElementById('jasa-nama').value = ''; document.getElementById('jasa-harga').value = '';
}
function loadDetailJasa(){
    const el = document.getElementById('list-jasa-detail');
    if(antrianAktif.jasa.length === 0) { el.innerHTML = 'Belum ada jasa'; return; }
    el.innerHTML = antrianAktif.jasa.map(j => `<div class="item-keranjang"><span>${j.nama}</span><span>Rp ${j.harga.toLocaleString('id-ID')} <button onclick="hapusJasaAntrian(${j.id})">X</button></span></div>`).join('');
}
function hapusJasaAntrian(id){ antrianAktif.jasa = antrianAktif.jasa.filter(j => j.id !== id); localStorage.setItem('antrian', JSON.stringify(antrian)); loadDetailJasa(); }
function tambahPartToAntrian(){
    if(!antrianAktif) return;
    const nama = document.getElementById('part-nama').value; const qty = parseInt(document.getElementById('part-qty').value) || 1;
    const p = produk.find(x => x.nama === nama); if(!p) return alert('Part tidak ditemukan');
    antrianAktif.part.push({...p, qty});
    localStorage.setItem('antrian', JSON.stringify(antrian)); loadDetailPart();
    document.getElementById('part-nama').value = '';
}
function loadDetailPart(){
    const el = document.getElementById('list-part-detail');
    if(antrianAktif.part.length === 0) { el.innerHTML = 'Belum ada part'; return; }
    el.innerHTML = antrianAktif.part.map(p => `<div class="item-keranjang"><span>${p.nama} x${p.qty}</span><span>Rp ${(p.harga*p.qty).toLocaleString('id-ID')}</span></div>`).join('');
}
function pindahKeBilling(){
    if(!antrianAktif) return;
    keranjang = [];
    antrianAktif.jasa.forEach(j => keranjang.push({...j, qty:1, tipe:'jasa'}));
    antrianAktif.part.forEach(p => keranjang.push({...p, tipe:'part'}));
    tampilkanKeranjang(); tutupModal('modal-detail-servis'); alert('Data antrian sudah dipindah ke Billing');
}

// SETTING
function simpanProduk(){
    const nama = document.getElementById('nama-produk').value.trim(); const harga = parseInt(document.getElementById('harga-produk').value); const stok = parseInt(document.getElementById('stok-produk').value) || 0;
    if (!nama ||!harga) return alert('Lengkapi Nama dan Harga');
    produk.push({ id: Date.now(), nama, harga, stok }); localStorage.setItem('produk', JSON.stringify(produk));
    loadProduk(); loadPart(); document.getElementById('nama-produk').value = ''; document.getElementById('harga-produk').value = '';
}
function loadPart(){
    const el = document.getElementById('list-part');
    if (produk.length === 0) { el.innerHTML = 'Belum ada part'; return; }
    el.innerHTML = produk.map(p => `<div class="item-keranjang"><span>${p.nama}</span><span>Stok:${p.stok} | Rp ${p.harga.toLocaleString('id-ID')}</span></div>`).join('');
    document.getElementById('part-nama').innerHTML = '<option value="">- Pilih Part -</option>' + produk.map(p => `<option value="${p.nama}">${p.nama}</option>`).join('');
}
function simpanMekanik(){
    const nama = document.getElementById('nama-mekanik').value.trim();
    if (!nama) return alert('Nama wajib diisi');
    mekanik.push({ id: Date.now(), nama, gaji: 0 }); localStorage.setItem('mekanik', JSON.stringify(mekanik));
    loadMekanik(); loadMekanikToSelect(); document.getElementById('nama-mekanik').value = '';
}
function loadMekanik(){
    const el = document.getElementById('list-mekanik');
    if (mekanik.length === 0) { el.innerHTML = 'Belum ada data'; return; }
    el.innerHTML = mekanik.map(m => `<div class="item-keranjang"><span>${m.nama}</span><span>Rp ${m.gaji.toLocaleString('id-ID')}</span></div>`).join('');
}
function simpanSetting(){
    setting.nama = document.getElementById('setting-nama').value; setting.alamat = document.getElementById('setting-alamat').value;
    localStorage.setItem('setting', JSON.stringify(setting)); alert('Setting tersimpan');
}
function exportData(){
    const data = { produk, antrian, mekanik, setting };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'backup_otopos.json'; a.click();
}
function handleImport(event){
    const file = event.target.files[0]; if(!file) return; const reader = new FileReader();
    reader.onload = function(e){
        const data = JSON.parse(e.target.result);
        produk = data.produk || []; antrian = data.antrian || []; mekanik = data.mekanik || []; setting = data.setting || setting;
        localStorage.setItem('produk', JSON.stringify(produk)); localStorage.setItem('antrian', JSON.stringify(antrian));
        localStorage.setItem('mekanik', JSON.stringify(mekanik)); localStorage.setItem('setting', JSON.stringify(setting)); location.reload();
    }; reader.readAsText(file);
}

// CHECKOUT
function checkout(){
    if(keranjang.length === 0) return alert('Keranjang kosong');
    const total = keranjang.reduce((sum, i) => sum + i.harga * i.qty, 0);
    alert(`Mode: ${mode.toUpperCase()}\nCheckout Sukses\nTotal: Rp ${total.toLocaleString('id-ID')}`);
    keranjang.filter(i => i.tipe === 'part').forEach(item => { const p = produk.find(x => x.id === item.id); if(p) p.stok -= item.qty; });
    localStorage.setItem('produk', JSON.stringify(produk)); loadProduk(); loadPart(); keranjang = []; tampilkanKeranjang();
}