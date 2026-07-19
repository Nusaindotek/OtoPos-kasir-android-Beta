let produk = JSON.parse(localStorage.getItem('produk')) || [];
let antrian = JSON.parse(localStorage.getItem('antrian')) || [];
let mekanik = JSON.parse(localStorage.getItem('mekanik')) || [];
let riwayat = JSON.parse(localStorage.getItem('riwayat')) || []; // DATA BARU
let keranjang = [];
let mode = 'servis';
let setting = JSON.parse(localStorage.getItem('setting')) || { nama: 'OTOPOS', alamat: '' };
let antrianAktif = null;

function init(){
    loadProduk(); loadAntrian(); loadMekanik(); loadPart(); loadMekanikToSelect();
    tampilkanKeranjang(); setMode('servis');
    document.getElementById('setting-nama').value = setting.nama;
    document.getElementById('setting-alamat').value = setting.alamat;
    document.getElementById('filter-tanggal').valueAsDate = new Date(); // default hari ini
}

// GLOBAL
function bukaModal(id){
    document.getElementById(id).classList.remove('hidden');
    if(id === 'modal-setting') loadRiwayat(); // auto load pas buka setting
}
function tutupModal(id){ document.getElementById(id).classList.add('hidden'); antrianAktif = null; }
function showTab(id, el){
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-active'));
    el.classList.add('tab-active');
}

//... [FUNGSI MODE, KERANJANG, ANTRIAN, DETAIL SAMA SEMUA]...

// FUNGSI BARU: SIMPAN RIWAYAT SAAT CHECKOUT
function simpanRiwayat(total){
    const transaksi = {
        id: Date.now(),
        tanggal: new Date().toISOString(),
        mode: mode,
        nopol: antrianAktif? antrianAktif.nopol : 'DIRECT PART',
        motor: antrianAktif? antrianAktif.motor : '-',
        mekanikId: antrianAktif? antrianAktif.mekanikId : null,
        items: [...keranjang], // copy keranjang
        total: total
    };
    riwayat.push(transaksi);
    localStorage.setItem('riwayat', JSON.stringify(riwayat));
}

// FUNGSI BARU: LOAD RIWAYAT + RINGKASAN
function loadRiwayat(){
    const tglFilter = document.getElementById('filter-tanggal').value;
    const dataHariIni = riwayat.filter(r => r.tanggal.split('T')[0] === tglFilter);

    // Hitung ringkasan
    const totalOmset = dataHariIni.reduce((sum, r) => sum + r.total, 0);
    const totalTransaksi = dataHariIni.length;
    const totalJasa = dataHariIni.reduce((sum, r) => sum + r.items.filter(i => i.tipe === 'jasa').reduce((s, i) => s + i.harga*i.qty, 0), 0);
    const totalPart = totalOmset - totalJasa;

    document.getElementById('ringkasan-harian').innerHTML = `
        Transaksi: ${totalTransaksi} | Omset: Rp ${totalOmset.toLocaleString('id-ID')}<br>
        Jasa: Rp ${totalJasa.toLocaleString('id-ID')} | Part: Rp ${totalPart.toLocaleString('id-ID')}
    `;

    // Tampilkan list
    const el = document.getElementById('list-riwayat');
    if(dataHariIni.length === 0) { el.innerHTML = 'Belum ada transaksi'; return; }
    el.innerHTML = dataHariIni.reverse().map(r => {
        const jam = new Date(r.tanggal).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
        const mekanikNama = r.mekanikId? mekanik.find(m => m.id === r.mekanikId)?.nama : '-';
        return `
            <div class="item-keranjang">
                <div>
                    <b>${jam}</b> - ${r.nopol} <br>
                    <small>Mode: ${r.mode} | Mekanik: ${mekanikNama}</small>
                </div>
                <div><b>Rp ${r.total.toLocaleString('id-ID')}</b></div>
            </div>
        `;
    }).join('');
}

//... [FUNGSI SETTING, EXPORT IMPORT SAMA]...

// CHECKOUT - UDAH DI UPDATE
function checkout(){
    if(keranjang.length === 0) return alert('Keranjang kosong');
    const total = keranjang.reduce((sum, i) => sum + i.harga * i.qty, 0);

    cetakStruk(total);
    simpanRiwayat(total); // SIMPAN KE RIWAYAT

    keranjang.filter(i => i.tipe === 'part').forEach(item => {
        const p = produk.find(x => x.id === item.id);
        if(p) p.stok -= item.qty;
    });
    localStorage.setItem('produk', JSON.stringify(produk));
    loadProduk();
    loadPart();
    if(mode === 'servis' && antrianAktif){ hapusAntrian(antrianAktif.id); }
    keranjang = [];
    tampilkanKeranjang();
}

// FUNGSI CETAK STRUK DAN LAINNYA TETAP SAMA SEPERTI SEBELUMNYA
function cetakStruk(total){
    const area = document.getElementById('area-struk');
    const tanggal = new Date().toLocaleString('id-ID');
    const mekanikNama = antrianAktif && antrianAktif.mekanikId? mekanik.find(m => m.id === antrianAktif.mekanikId).nama : '-';
    const nopol = antrianAktif? antrianAktif.nopol : 'DIRECT PART';
    let listItem = '';
    keranjang.forEach(i => {
        listItem += `<div class="struk-item"><span>${i.nama} ${i.tipe === 'part'? 'x'+i.qty : ''}</span><span>Rp ${(i.harga*i.qty).toLocaleString('id-ID')}</span></div>`;
    });
    area.innerHTML = `
        <div class="struk-header"><div style="font-size:14px">${setting.nama.toUpperCase()}</div><div>${setting.alamat}</div><div class="struk-line"></div></div>
        <div>Tanggal: ${tanggal}</div><div>Nopol: ${nopol}</div><div>Mekanik: ${mekanikNama}</div><div>Mode: ${mode.toUpperCase()}</div><div class="struk-line"></div>
        ${listItem}<div class="struk-line"></div>
        <div class="struk-item" style="font-weight:bold; font-size:12px"><span>TOTAL</span><span>Rp ${total.toLocaleString('id-ID')}</span></div>
        <div class="struk-line"></div><div style="text-align:center">Terima Kasih</div>
    `;
    window.print();
}

//... SISA FUNGSI ANTRIAN, SETTING DLL TETAP SAMA COPY DARI SEBELUMNYA...