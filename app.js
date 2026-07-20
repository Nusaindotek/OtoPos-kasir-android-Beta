let produk = JSON.parse(localStorage.getItem('produk')) || [];
let antrian = JSON.parse(localStorage.getItem('antrian')) || [];
let mekanik = JSON.parse(localStorage.getItem('mekanik')) || [];
let riwayat = JSON.parse(localStorage.getItem('riwayat')) || [];
let keranjang = [];
let mode = 'servis';
let setting = JSON.parse(localStorage.getItem('setting')) || { nama: 'OTOPOS', alamat: '' };
let antrianAktif = null;

let editProdukId = null;
let editMekanikId = null;

function init(){
    document.getElementById('header-toko').innerText = '🔧 ' + setting.nama.toUpperCase();
    loadProduk(); loadAntrian(); loadPart(); loadMekanikToSelect(); loadMekanik(); loadGajiMekanik();
    tampilkanKeranjang(); setMode('servis');
    document.getElementById('setting-nama').value = setting.nama;
    document.getElementById('setting-alamat').value = setting.alamat;
    document.getElementById('filter-tanggal').valueAsDate = new Date();
}

function bukaModal(id){
    document.getElementById(id).classList.remove('hidden');
    if(id === 'modal-setting') {
        loadRiwayat();
        loadGajiMekanik();
    }
}

function tutupModal(id){
    document.getElementById(id).classList.add('hidden');
    if(id !== 'modal-detail-servis') {
        antrianAktif = null;
    }
    editProdukId = null;
    editMekanikId = null;
    document.getElementById('nama-produk').value = '';
    document.getElementById('harga-produk').value = '';
    document.getElementById('stok-produk').value = '0';
    document.getElementById('nama-mekanik').value = '';
}

function showTab(id, el){
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-active'));
    el.classList.add('tab-active');
}

function setMode(m){
    mode = m;
    const btnServis = document.getElementById('btn-servis');
    const btnPart = document.getElementById('btn-part');

    if(m === 'servis'){
        btnServis.className = 'btn btn-green';
        btnPart.className = 'btn btn-gray';
        document.getElementById('area-servis').classList.remove('hidden');
        document.getElementById('area-jasa').style.display = 'block';
        document.getElementById('judul-input').innerText = 'TAMBAH KE BILLING SERVIS';
        document.getElementById('mode-label').innerText = 'SERVIS';
        document.getElementById('mode-label').style.background = '#ef4444';
    } else {
        btnServis.className = 'btn btn-gray';
        btnPart.className = 'btn btn-orange';
        document.getElementById('area-servis').classList.add('hidden');
        document.getElementById('area-jasa').style.display = 'none';
        document.getElementById('judul-input').innerText = 'TAMBAH KE BILLING DIRECT PART';
        document.getElementById('mode-label').innerText = 'PART';
        document.getElementById('mode-label').style.background = '#16a34a';
        keranjang = []; tampilkanKeranjang();
    }
}

function loadProduk(){ document.getElementById('list-produk').innerHTML = produk.map(p => `<option value="${p.nama}">`).join(''); }

function tambahKeKeranjang(){
    const nama = document.getElementById('input-produk').value.trim();
    const qty = parseInt(document.getElementById('input-qty').value) || 1;
    const p = produk.find(x => x.nama === nama);
    if (!p) return alert('Produk tidak ditemukan');
    if(p.stok < qty) return alert('Stok tidak cukup. Sisa: ' + p.stok);
    const item = keranjang.find(x => x.id === p.id);
    if (item) item.qty += qty; else keranjang.push({...p, qty, tipe: 'part' });

    document.getElementById('btn-part').disabled = true;
    document.getElementById('btn-servis').disabled = true;

    tampilkanKeranjang(); document.getElementById('input-produk').value = '';
}

function tambahJasaKeKeranjang(){
    const nama = document.getElementById('input-jasa').value.trim();
    const harga = parseInt(document.getElementById('harga-jasa').value) || 0;
    if(!nama || !harga) return alert('Lengkapi Nama Jasa dan Harga');
    keranjang.push({ id: Date.now(), nama, harga, qty: 1, tipe: 'jasa' });

    document.getElementById('btn-part').disabled = true;
    document.getElementById('btn-servis').disabled = true;

    tampilkanKeranjang(); document.getElementById('input-jasa').value = ''; document.getElementById('harga-jasa').value = '';
}

function hitungKembalian(){
    const total = keranjang.reduce((sum, i) => sum + i.harga * i.qty, 0);
    const bayar = parseInt(document.getElementById('input-bayar').value) || 0;
    const kembali = bayar - total;
    document.getElementById('input-kembalian').value = kembali >= 0 ? `Rp ${kembali.toLocaleString('id-ID')}` : 'Kurang';
}

function tampilkanKeranjang(){
    const total = keranjang.reduce((sum, i) => sum + i.harga * i.qty, 0);
    document.getElementById('total-harga').innerText = `Rp ${total.toLocaleString('id-ID')}`;
    const el = document.getElementById('list-keranjang');
    if (keranjang.length === 0) { 
        el.innerText = 'Keranjang kosong'; 
        document.getElementById('input-bayar').value=''; 
        document.getElementById('input-kembalian').value=''; 
        document.getElementById('btn-servis').disabled = false;
        document.getElementById('btn-part').disabled = false;
        return; 
    }
    el.innerHTML = keranjang.map(i => `<div class="item-keranjang"><span>${i.nama} ${i.tipe === 'jasa'? '' : 'x'+i.qty}</span><div><span>Rp ${(i.harga*i.qty).toLocaleString('id-ID')} </span><button onclick="hapusKeranjang(${i.id})">X</button></div></div>`).join('');
    hitungKembalian();
}

function hapusKeranjang(id){ 
    keranjang = keranjang.filter(i => i.id !== id); 
    tampilkanKeranjang(); 
}

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
    el.innerHTML = antrian.map(a => {
        const mek = mekanik.find(m => m.id === parseInt(a.mekanikId));
        const namaMekanik = mek ? mek.nama : 'Belum Dipilih';
        return `<div class="item-keranjang" style="cursor:pointer" onclick="bukaDetailAntrian(${a.id})">
            <span><b>${a.nopol}</b> - ${a.motor} <br><small style="color:#64748b">Mekanik: ${namaMekanik}</small></span>
            <button onclick="event.stopPropagation(); hapusAntrian(${a.id})">Hapus</button>
        </div>`;
    }).join('');
}

function hapusAntrian(id){
    if(!confirm('Hapus antrian ini dari daftar?')) return;
    antrian = antrian.filter(a => a.id !== id);
    localStorage.setItem('antrian', JSON.stringify(antrian));
    loadAntrian();
}

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
    localStorage.setItem('antrian', JSON.stringify(antrian)); 
    loadAntrian(); 
    alert('Data servis tersimpan');
}

function loadMekanikToSelect(){
    const el = document.getElementById('select-mekanik');
    el.innerHTML = '<option value="">- Pilih Mekanik -</option>' + mekanik.map(m => `<option value="${m.id}">${m.nama}</option>`).join('');
}

function tambahJasaToAntrian(){
    if(!antrianAktif) return;
    const nama = document.getElementById('jasa-nama').value; 
    const harga = parseInt(document.getElementById('jasa-harga').value);
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
    const nama = document.getElementById('part-nama').value;
    const qty = parseInt(document.getElementById('part-qty').value) || 1;
    const p = produk.find(x => x.nama === nama);
    if(!p) return alert('Part tidak ditemukan');
    if(p.stok < qty) return alert('Stok tidak cukup. Sisa: ' + p.stok);
    antrianAktif.part.push({...p, qty});
    localStorage.setItem('antrian', JSON.stringify(antrian));
    loadDetailPart();
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
    document.getElementById('btn-part').disabled = true;
    tampilkanKeranjang(); tutupModal('modal-detail-servis'); alert('Data antrian sudah dipindah ke Billing');
}

function simpanProduk(){
    const nama = document.getElementById('nama-produk').value.trim();
    const harga = parseInt(document.getElementById('harga-produk').value);
    const stok = parseInt(document.getElementById('stok-produk').value) || 0;
    if (!nama || !harga) return alert('Lengkapi Nama dan Harga');
    if(editProdukId){
        const p = produk.find(x => x.id === editProdukId);
        p.nama = nama; p.harga = harga; p.stok = stok;
        editProdukId = null;
    } else {
        if(produk.find(p => p.nama.toLowerCase() === nama.toLowerCase())) return alert('Nama part sudah ada');
        produk.push({ id: Date.now(), nama, harga, stok });
    }
    localStorage.setItem('produk', JSON.stringify(produk));
    loadProduk(); loadPart(); tutupModal('modal-setting'); bukaModal('modal-setting');
}

function loadPart(){
    const el = document.getElementById('list-part');
    if (produk.length === 0) { el.innerHTML = 'Belum ada part'; return; }
    el.innerHTML = produk.map(p => `
        <div class="item-keranjang">
            <span>${p.nama}</span>
            <div>
                <span>Stok:${p.stok} | Rp ${p.harga.toLocaleString('id-ID')}</span>
                <button style="background:#2563eb" onclick="editProduk(${p.id})">Edit</button>
                <button onclick="hapusProduk(${p.id})">Hapus</button>
            </div>
        </div>`).join('');
    document.getElementById('part-nama').innerHTML = '<option value="">- Pilih Part -</option>' + produk.map(p => `<option value="${p.nama}">${p.nama}</option>`).join('');
}

function editProduk(id){
    const p = produk.find(x => x.id === id);
    editProdukId = id;
    document.getElementById('nama-produk').value = p.nama;
    document.getElementById('harga-produk').value = p.harga;
    document.getElementById('stok-produk').value = p.stok;
}

function hapusProduk(id){
    if(!confirm('Hapus part ini?')) return;
    produk = produk.filter(p => p.id !== id);
    localStorage.setItem('produk', JSON.stringify(produk));
    loadProduk(); loadPart();
}

function simpanMekanik(){
    const nama = document.getElementById('nama-mekanik').value.trim();
    if (!nama) return alert('Nama wajib diisi');
    if(editMekanikId){
        const m = mekanik.find(x => x.id === editMekanikId);
        m.nama = nama;
        editMekanikId = null;
    } else {
        if(mekanik.find(m => m.nama.toLowerCase() === nama.toLowerCase())) return alert('Nama mekanik sudah ada');
        mekanik.push({ id: Date.now(), nama, saldoGaji: 0 });
    }
    localStorage.setItem('mekanik', JSON.stringify(mekanik));
    loadMekanik(); loadMekanikToSelect(); loadGajiMekanik(); tutupModal('modal-setting'); bukaModal('modal-setting');
}

function loadMekanik(){
    const el = document.getElementById('list-mekanik');
    if (mekanik.length === 0) { el.innerHTML = 'Belum ada data'; return; }
    el.innerHTML = mekanik.map(m => `
        <div class="item-keranjang">
            <span>${m.nama}</span>
            <div>
                <button style="background:#2563eb" onclick="editMekanik(${m.id})">Edit</button>
                <button onclick="hapusMekanik(${m.id})">Hapus</button>
            </div>
        </div>`).join('');
}

function editMekanik(id){
    const m = mekanik.find(x => x.id === id);
    editMekanikId = id;
    document.getElementById('nama-mekanik').value = m.nama;
}

function hapusMekanik(id){
    if(!confirm('Hapus mekanik ini?')) return;
    mekanik = mekanik.filter(m => m.id !== id);
    localStorage.setItem('mekanik', JSON.stringify(mekanik));
    loadMekanik(); loadMekanikToSelect(); loadGajiMekanik();
}

function loadGajiMekanik(){
    const el = document.getElementById('list-gaji');
    if (!el) return;
    if (mekanik.length === 0) { el.innerHTML = 'Belum ada data mekanik'; return; }
    el.innerHTML = mekanik.map(m => `
        <div class="item-keranjang">
            <span><b>${m.nama}</b></span>
            <div>
                <span style="margin-right:10px; font-weight:bold; color:#16a34a">Rp ${(m.saldoGaji || 0).toLocaleString('id-ID')}</span>
                <button style="background:#16a34a" onclick="resetGaji(${m.id})">Reset / Bayar</button>
            </div>
        </div>`).join('');
}

function resetGaji(id){
    const m = mekanik.find(x => x.id === id);
    if(!m) return;
    if(!confirm(`Apakah Anda yakin gaji dari ${m.nama} sebesar Rp ${(m.saldoGaji || 0).toLocaleString('id-ID')} sudah dibayarkan dan ingin direset ke 0?`)) return;
    m.saldoGaji = 0;
    localStorage.setItem('mekanik', JSON.stringify(mekanik));
    loadGajiMekanik();
}

function simpanSetting(){
    setting.nama = document.getElementById('setting-nama').value;
    setting.alamat = document.getElementById('setting-alamat').value;
    localStorage.setItem('setting', JSON.stringify(setting));
    document.getElementById('header-toko').innerText = '🔧 ' + setting.nama.toUpperCase();
    alert('Setting tersimpan');
}

function simpanRiwayat(total, bayar, kembali){
    const mekanikObj = mekanik.find(m => m.id === (antrianAktif ? parseInt(antrianAktif.mekanikId) : null));
    const transaksi = {
        id: Date.now(), 
        tanggal: new Date().toISOString(), 
        mode: mode,
        nopol: antrianAktif ? antrianAktif.nopol : 'DIRECT PART',
        motor: antrianAktif ? antrianAktif.motor : '-',
        mekanikId: antrianAktif ? antrianAktif.mekanikId : null,
        namaMekanik: mekanikObj ? mekanikObj.nama : '-',
        items: [...keranjang], 
        total: total, 
        bayar: bayar, 
        kembali: kembali
    };
    riwayat.push(transaksi);
    localStorage.setItem('riwayat', JSON.stringify(riwayat));
}

function loadRiwayat(){
    const tglFilter = document.getElementById('filter-tanggal').value;
    const dataHariIni = riwayat.filter(r => r.tanggal.split('T')[0] === tglFilter);
    const totalOmset = dataHariIni.reduce((sum, r) => sum + r.total, 0);
    const totalTransaksi = dataHariIni.length;
    const totalJasa = dataHariIni.reduce((sum, r) => sum + r.items.filter(i => i.tipe === 'jasa').reduce((s, i) => s + i.harga*i.qty, 0), 0);
    const totalPart = totalOmset - totalJasa;
    document.getElementById('ringkasan-harian').innerHTML = `Transaksi: ${totalTransaksi} | Omset: Rp ${totalOmset.toLocaleString('id-ID')}<br>Jasa: Rp ${totalJasa.toLocaleString('id-ID')} | Part: Rp ${totalPart.toLocaleString('id-ID')}`;
    const el = document.getElementById('list-riwayat');
    if(dataHariIni.length === 0) { el.innerHTML = 'Belum ada transaksi'; return; }
    el.innerHTML = dataHariIni.reverse().map(r => {
        const jam = new Date(r.tanggal).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
        return `<div class="item-keranjang"><div><b>${jam}</b> - ${r.nopol} <br><small>Mode: ${r.mode} | Mekanik: ${r.namaMekanik || '-'}</small></div><div><b>Rp ${r.total.toLocaleString('id-ID')}</b></div></div>`;
    }).join('');
}

function exportData(){
    const data = { produk, antrian, mekanik, riwayat, setting };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'backup_otopos.json'; a.click();
}

function handleImport(event){
    const file = event.target.files[0]; if(!file) return; const reader = new FileReader();
    reader.onload = function(e){
        const data = JSON.parse(e.target.result);
        produk = data.produk || []; antrian = data.antrian || []; mekanik = data.mekanik || []; riwayat = data.riwayat || []; setting = data.setting || setting;
        localStorage.setItem('produk', JSON.stringify(produk)); localStorage.setItem('antrian', JSON.stringify(antrian));
        localStorage.setItem('mekanik', JSON.stringify(mekanik)); localStorage.setItem('riwayat', JSON.stringify(riwayat)); localStorage.setItem('setting', JSON.stringify(setting));
        alert('Import berhasil'); location.reload();
    }; reader.readAsText(file);
}

function cetakStruk(total, bayar, kembali){
    const area = document.getElementById('area-struk');
    const tanggal = new Date().toLocaleString('id-ID');
    const mekanikObj = mekanik.find(m => m.id === (antrianAktif ? parseInt(antrianAktif.mekanikId) : null));
    const namaMek = mekanikObj ? mekanikObj.nama : '-';
    const nopol = antrianAktif ? antrianAktif.nopol : 'DIRECT PART';
    let listItem = '';
    keranjang.forEach(i => { listItem += `<div class="struk-item"><span>${i.nama} ${i.tipe === 'part'? 'x'+i.qty : ''}</span><span>Rp ${(i.harga*i.qty).toLocaleString('id-ID')}</span></div>`; });
    area.innerHTML = `<div class="struk-header"><div style="font-size:14px">${setting.nama.toUpperCase()}</div><div>${setting.alamat}</div><div class="struk-line"></div></div><div>Tanggal: ${tanggal}</div><div>Nopol: ${nopol}</div><div>Mekanik: ${namaMekanik}</div><div>Mode: ${mode.toUpperCase()}</div><div class="struk-line"></div>${listItem}<div class="struk-line"></div><div class="struk-item"><span>SUBTOTAL</span><span>Rp ${total.toLocaleString('id-ID')}</span></div><div class="struk-item"><span>BAYAR</span><span>Rp ${bayar.toLocaleString('id-ID')}</span></div><div class="struk-item"><span>KEMBALI</span><span>Rp ${kembali.toLocaleString('id-ID')}</span></div><div class="struk-line"></div><div style="text-align:center">Terima Kasih</div>`;
    window.print();
}

function checkout(){
    if(keranjang.length === 0) return alert('Keranjang kosong');
    const total = keranjang.reduce((sum, i) => sum + i.harga * i.qty, 0);
    const bayar = parseInt(document.getElementById('input-bayar').value) || 0;
    if(bayar < total) return alert('Uang bayar kurang!');
    const kembali = bayar - total;

    // DISTRIBUSI GAJI MEKANIK
    if(mode === 'servis' && antrianAktif && antrianAktif.mekanikId){
        const totalJasaDariKeranjang = keranjang.filter(i => i.tipe === 'jasa').reduce((sum, item) => sum + (item.harga * item.qty), 0);
        let mek = mekanik.find(m => m.id === parseInt(antrianAktif.mekanikId));
        if(mek) {
            mek.saldoGaji = (mek.saldoGaji || 0) + totalJasaDariKeranjang;
            localStorage.setItem('mekanik', JSON.stringify(mekanik));
        }
    }

    cetakStruk(total, bayar, kembali);
    simpanRiwayat(total, bayar, kembali);

    keranjang.filter(i => i.tipe === 'part').forEach(item => {
        const p = produk.find(x => x.id === item.id);
        if(p) p.stok -= item.qty;
    });

    localStorage.setItem('produk', JSON.stringify(produk));
    loadProduk();
    loadPart();

    if(mode === 'servis' && antrianAktif){ 
        antrian = antrian.filter(a => a.id !== antrianAktif.id);
        localStorage.setItem('antrian', JSON.stringify(antrian));
        loadAntrian();
    }

    document.getElementById('btn-servis').disabled = false;
    document.getElementById('btn-part').disabled = false;

    keranjang = [];
    antrianAktif = null;
    document.getElementById('input-bayar').value = '';
    tampilkanKeranjang();
}