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

// VARIABEL BARU UNTUK LAPORAN
let riwayatTransaksi = JSON.parse(localStorage.getItem('otopos_riwayat_transaksi')) || [];
let riwayatStok = JSON.parse(localStorage.getItem('otopos_riwayat_stok')) || [];

window.onload = () => { refreshDatalist(); renderCart(); renderMekanik(); loadSetting(); renderAntrian(); };

document.addEventListener('keydown', (e) => { 
    if(e.key === 'F2') { e.preventDefault(); setMode('servis'); } 
    if(e.key === 'F3') { e.preventDefault(); setMode('part'); } 
    if(e.key === 'F4') { e.preventDefault(); toggleModal('settings-modal'); } 
    if(e.key === 'F5') { e.preventDefault(); toggleModal('input-modal'); } 
    if(e.ctrlKey && e.key === 'Enter') { e.preventDefault(); tambahKeBilling(); } 
    if(e.ctrlKey && e.key === 'p') { e.preventDefault(); prosesCheckout(); } 
});

function setMode(mode) {
    if(currentMode === 'servis') { cartServis = cart; localStorage.setItem('otopos_cartServis', JSON.stringify(cartServis)); }
    else { cartDirect = cart; localStorage.setItem('otopos_cartDirect', JSON.stringify(cartDirect)); }

    currentMode = mode;
    selectedAntrian = null;
    if(mode === 'servis') { cart = cartServis; } else { cart = cartDirect; }

    renderCart(); renderAntrian(); document.getElementById('form-servis-detail').classList.add('hidden');
    const tabS = document.getElementById('tab-servis'); const tabP = document.getElementById('tab-part'); const btn = document.getElementById('btn-tambah');
    if(mode === 'servis') {
        document.getElementById('area-servis').classList.remove('hidden'); document.getElementById('area-part').classList.add('hidden');
        tabS.className = "btn-press py-2.5 rounded-lg font-black text-sm flex justify-center items-center gap-2 tab-active bg-red-600 text-white shadow-lg";
        tabP.className = "btn-press py-2.5 rounded-lg font-black text-sm flex justify-center items-center gap-2 text-gray-500 hover:text-gray-800";
        document.getElementById('billing-type').innerText = "SERVIS";
        btn.className = "btn-press w-full mt-3 bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-lg text-white font-black py-3 rounded-xl text-sm flex justify-center items-center gap-2";
    }
    else {
        document.getElementById('area-servis').classList.add('hidden'); document.getElementById('area-part').classList.remove('hidden');
        tabP.className = "btn-press py-2.5 rounded-lg font-black text-sm flex justify-center items-center gap-2 tab-active bg-emerald-600 text-white shadow-lg";
        tabS.className = "btn-press py-2.5 rounded-lg font-black text-sm flex justify-center items-center gap-2 text-gray-500 hover:text-gray-800";
        document.getElementById('billing-type').innerText = "DIRECT";
        btn.className = "btn-press w-full mt-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-lg text-white font-black py-3 rounded-xl text-sm flex justify-center items-center gap-2";
    }
}
function toggleModal(id) { document.getElementById(id).classList.toggle('hidden'); }

function openTab(id, event) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('border-blue-600', 'text-blue-600');
        b.classList.add('border-transparent', 'text-gray-500');
    });
    const activeBtn = event.currentTarget || event.target;
    activeBtn.classList.remove('border-transparent', 'text-gray-500');
    activeBtn.classList.add('border-blue-600', 'text-blue-600');
}

function tambahAntrian() { const nopol = document.getElementById('input-nopol-baru').value.toUpperCase(); const motor = document.getElementById('input-motor-baru').value; if(!nopol ||!motor) return alert('Nopol dan Motor wajib!'); antrian.push({id: Date.now(), nopol, motor}); localStorage.setItem('otopos_antrian', JSON.stringify(antrian)); renderAntrian(); document.getElementById('input-nopol-baru').value=''; document.getElementById('input-motor-baru').value=''; toggleModal('antrian-modal'); }
function renderAntrian() { const list = document.getElementById('list-antrian'); if(antrian.length === 0) { list.innerHTML = `<p class="text-center text-gray-400 text-xs py-10">Belum ada antrian. Klik + Tambah Antrian</p>`; } else { list.innerHTML = antrian.map(a => `<div onclick="pilihAntrian(${a.id})" class="antrian-item p-3 border rounded-lg cursor-pointer ${selectedAntrian?.id === a.id? 'antrian-active' : ''}"><p class="font-black text-red-600">${a.nopol}</p><p class="text-xs text-gray-600">${a.motor}</p></div>`).join(''); } }
function pilihAntrian(id) { selectedAntrian = antrian.find(a=>a.id===id); renderAntrian(); const form = document.getElementById('form-servis-detail'); form.classList.remove('hidden'); form.innerHTML = `<h4 class="font-black mb-2 text-sm">Proses: ${selectedAntrian.nopol} - ${selectedAntrian.motor}</h4><div class="grid grid-cols-2 gap-2"><div><label class="text-xs font-bold">Mekanik</label><select id="input-mekanik" class="w-full border p-2 rounded text-sm">${mekanik.map(m => `<option value="${m.nama}">${m.nama}</option>`).join('')}</select></div><div><label class="text-xs font-bold">Biaya Jasa</label><input type="number" id="input-jasa" value="0" class="w-full border p-2 rounded text-sm"></div></div>`; }

function refreshDatalist() { 
    const list = document.getElementById('list-produk'); 
    list.innerHTML = ''; 
    parts.forEach(p => { 
        const opt = document.createElement('option'); 
        opt.value = p.name;
        opt.innerText = `Sisa Stok: ${p.stock}`;
        list.appendChild(opt); 
    }); 
    const last = document.getElementById('last-input-list'); 
    if(last) last.innerHTML = '<b>Terakhir:</b><br>' + parts.slice(-3).reverse().map(p=>`${p.name} (Stok: ${p.stock}) - Rp ${p.price.toLocaleString()}`).join('<br>'); 
}

// LOGIKA TAMBAH STOK & CATAT LOG
function handleQuickAdd(loop) {
    const name = document.getElementById('input-part-name').value.trim();
    const price = parseInt(document.getElementById('input-part-price').value);
    const stock = parseInt(document.getElementById('input-part-stock').value) || 0;
    if(!name ||!price) return alert('Nama dan Harga wajib!');

    const isDuplicate = parts.some(p => p.name.toLowerCase() === name.toLowerCase());
    if (isDuplicate) {
        alert(`Gagal! Produk dengan nama "${name}" sudah ada di database.`);
        return;
    }

    parts.push({name, price, stock});
    catatRiwayatStok(name, 'Masuk', stock, 'Input Manual (F5)'); // LOG
    localStorage.setItem('otopos_parts', JSON.stringify(parts));
    refreshDatalist();
    if(loop) {
        document.getElementById('input-part-name').value='';
        document.getElementById('input-part-price').value='';
        document.getElementById('input-part-stock').value='0';
        document.getElementById('input-part-name').focus();
    } else {
        toggleModal('input-modal');
    }
}

// LOGIKA IMPORT & CATAT LOG
function handleImportCSV() {
    let skipCount = 0;
    document.getElementById('csv-input').value.split('\n').forEach(line => {
        const [name, price, stock] = line.split(',');
        if(name && price) {
            const cleanName = name.trim();
            const isDuplicate = parts.some(p => p.name.toLowerCase() === cleanName.toLowerCase());
            if (!isDuplicate) {
                const parsedStock = parseInt(stock)||0;
                parts.push({name: cleanName, price: parseInt(price), stock: parsedStock});
                catatRiwayatStok(cleanName, 'Masuk', parsedStock, 'Import CSV'); // LOG
            } else {
                skipCount++;
            }
        }
    });
    localStorage.setItem('otopos_parts', JSON.stringify(parts));
    refreshDatalist();
    if (skipCount > 0) alert(`Import Berhasil! (${skipCount} item duplikat dilewati secara otomatis)`);
    else alert('Import Berhasil!');
}

function tambahKeBilling() {
    const name = document.getElementById('input-produk-search').value.trim();
    let item = null;

    if (name) {
        item = parts.find(p => p.name === name);
        if(!item) return alert('Produk tidak ditemukan!');
    }

    if (currentMode === 'servis') {
        if(!selectedAntrian) return alert('Pilih antrian dulu!');
        const jasa = parseInt(document.getElementById('input-jasa').value) || 0;
        const jasaItem = cart.find(c => c.type === 'jasa');
        if(jasa > 0) {
            if(jasaItem) jasaItem.price = jasa;
            else cart.push({type: 'jasa', name: 'Biaya Jasa', price: jasa, qty: 1});
        } else if (jasa === 0 && jasaItem) {
            cart = cart.filter(c => c.type !== 'jasa');
        }
    }

    if (item) {
        const qty = parseInt(document.getElementById('input-qty').value) || 1;
        const existing = cart.find(c => c.name === name);

        const currentQtyInCart = existing ? existing.qty : 0;
        if(item.stock < (currentQtyInCart + qty)) {
            return alert(`Gagal! Sisa stok "${item.name}" hanya tinggal ${item.stock} item.`);
        }

        if(existing) existing.qty += qty; else cart.push({...item, qty, type: 'part'});
    } else if (currentMode !== 'servis') {
        return alert('Pilih produk terlebih dahulu!');
    }

    simpanCart(); renderCart(); 
    document.getElementById('input-produk-search').value = ''; 
    document.getElementById('input-qty').value = 1;
}
function simpanCart() { if(currentMode === 'servis') localStorage.setItem('otopos_cartServis', JSON.stringify(cart)); else localStorage.setItem('otopos_cartDirect', JSON.stringify(cart)); }

function changeQty(index, delta) { 
    const item = cart[index];
    if(item.type === 'part' && delta > 0) {
        const originalPart = parts.find(p => p.name === item.name);
        if(originalPart && originalPart.stock < (item.qty + delta)) {
            return alert(`Gagal! Stok maksimum untuk "${item.name}" adalah ${originalPart.stock}`);
        }
    }
    item.qty += delta; 
    if (item.qty <= 0) cart.splice(index, 1); 
    simpanCart(); 
    renderCart(); 
}

function renderCart() { const container = document.getElementById('cart-items'); if(cart.length === 0) { container.innerHTML = `<p class="text-center text-slate-500 text-xs py-10">Keranjang kosong</p>`; } else { container.innerHTML = cart.map((i, idx) => `<div class="flex justify-between items-center bg-slate-800 p-2 rounded-lg text-xs"><div><p class="font-bold">${i.name}</p><p class="text-slate-400 text-xs">x${i.qty} @ Rp ${i.price.toLocaleString()}</p></div><div class="flex items-center gap-1"><button onclick="changeQty(${idx},-1)" class="px-1.5 bg-slate-700 rounded">-</button><span>${i.qty}</span><button onclick="changeQty(${idx},1)" class="px-1.5 bg-slate-700 rounded">+</button><button onclick="changeQty(${idx},-999)" class="text-red-400 ml-1">✕</button></div></div>`).join(''); } const total = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0); document.getElementById('cart-total').innerText = 'Rp ' + total.toLocaleString(); }

function setPayment(method) { selectedPayment = method; document.querySelectorAll('.btn-pay').forEach(btn => { btn.className = btn.innerText.includes(method)? "btn-pay btn-press bg-slate-800 border border-emerald-500/50 text-emerald-400 text-xs font-bold py-2 rounded-lg" : "btn-pay btn-press bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold py-2 rounded-lg"; }); }

// PROSES CHECKOUT & CATAT SEMUA LOG TRANSAKSI / KELUAR BARANG
function prosesCheckout() {
    if(cart.length === 0) return alert('Keranjang kosong!'); 

    // Pengurangan stok & Catat Log
    cart.forEach(item => {
        if(item.type === 'part') {
            const dbItem = parts.find(p => p.name === item.name);
            if(dbItem) {
                dbItem.stock = Math.max(0, dbItem.stock - item.qty);
                catatRiwayatStok(item.name, 'Keluar', item.qty, `Terjual (${currentMode})`);
            }
        }
    });
    localStorage.setItem('otopos_parts', JSON.stringify(parts));
    refreshDatalist();

    const total = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
    
    // Log Transaksi Penjualan
    riwayatTransaksi.push({
        id: Date.now(),
        waktu: new Date().toLocaleString('id-ID'),
        tipe: currentMode,
        total: total,
        items: cart.map(i => ({name: i.name, qty: i.qty, price: i.price, type: i.type})),
        pembayaran: selectedPayment
    });
    localStorage.setItem('otopos_riwayat_transaksi', JSON.stringify(riwayatTransaksi));

    if(currentMode === 'servis') {
        if(!selectedAntrian) return alert('Pilih antrian dulu!');
        const namaMekanik = document.getElementById('input-mekanik').value; const jasa = cart.find(c=>c.type==='jasa')?.price || 0;

        const m = mekanik.find(x=>x.nama===namaMekanik); 
        if(m){ 
            m.servis++; 
            m.pendapatan += jasa; 
            if(!m.riwayat) m.riwayat = [];
            const waktuSekarang = new Date();
            const tanggal = waktuSekarang.toLocaleDateString('id-ID', {day: '2-digit', month: '2-digit'});
            const jam = waktuSekarang.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});
            m.riwayat.push({ waktu: `${tanggal} ${jam}`, nopol: selectedAntrian.nopol, motor: selectedAntrian.motor, jasa: jasa });
            localStorage.setItem('otopos_mekanik', JSON.stringify(mekanik)); 
        }

        document.getElementById('print-info').innerHTML = `Nopol: ${selectedAntrian.nopol}<br>Motor: ${selectedAntrian.motor}<br>Mekanik: ${namaMekanik}`;
        antrian = antrian.filter(a=>a.id!== selectedAntrian.id); localStorage.setItem('otopos_antrian', JSON.stringify(antrian)); renderAntrian(); selectedAntrian = null; document.getElementById('form-servis-detail').classList.add('hidden');
        cartServis = []; localStorage.setItem('otopos_cartServis', JSON.stringify(cartServis));
    } else {
        document.getElementById('print-info').innerHTML = `Pembeli: ${document.getElementById('input-pembeli').value || '-'}`;
        cartDirect = []; localStorage.setItem('otopos_cartDirect', JSON.stringify(cartDirect));
    }
    
    document.getElementById('print-nama-toko').innerText = setting.nama; document.getElementById('print-alamat-toko').innerText = setting.alamat; document.getElementById('print-footer').innerText = setting.footer; document.getElementById('print-payment').innerText = selectedPayment; document.getElementById('print-items').innerHTML = cart.map(i => `${i.name} x${i.qty}<div class="text-right">Rp ${(i.price * i.qty).toLocaleString()}</div>`).join(''); document.getElementById('print-total').innerText = 'TOTAL: Rp ' + total.toLocaleString(); window.print();
    cart = []; simpanCart(); renderCart();
}

function renderMekanik() { 
    document.getElementById('list-mekanik').innerHTML = mekanik.map((m, idx)=>`
        <div onclick="bukaModalGaji(${idx})" class="flex justify-between bg-gray-100 hover:bg-blue-50 border p-2.5 rounded-lg cursor-pointer transition-all duration-100 font-bold items-center">
            <div>
                <span class="text-gray-800">${m.nama}</span>
                <p class="text-[10px] text-gray-500 font-normal">Klik untuk detail penggajian</p>
            </div>
            <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px]">Rp ${m.pendapatan.toLocaleString()}</span>
        </div>
    `).join(''); 
}

function bukaModalGaji(idx) {
    const m = mekanik[idx];
    if(!m.riwayat) m.riwayat = [];

    document.getElementById('detail-gaji-nama').innerText = m.nama;
    document.getElementById('detail-gaji-servis').innerText = m.servis + 'x';
    document.getElementById('detail-gaji-total').innerText = 'Rp ' + m.pendapatan.toLocaleString();

    const riwayatList = document.getElementById('detail-gaji-riwayat');
    if(m.riwayat.length === 0) {
        riwayatList.innerHTML = `<p class="text-center text-gray-400 py-6">Belum ada riwayat kerja.</p>`;
    } else {
        riwayatList.innerHTML = m.riwayat.map(r => `
            <div class="bg-white p-2 border rounded shadow-sm flex justify-between items-center">
                <div>
                    <p class="font-bold text-gray-800 text-[11px]">${r.nopol} <span class="font-normal text-gray-500">(${r.motor})</span></p>
                    <p class="text-[9px] text-gray-400">🕒 ${r.waktu}</p>
                </div>
                <span class="text-emerald-600 font-black text-[11px]">Rp ${r.jasa.toLocaleString()}</span>
            </div>
        `).join('');
    }

    document.getElementById('btn-print-gaji').onclick = () => cetakSlipGaji(idx);
    document.getElementById('btn-reset-gaji').onclick = () => resetDataMekanik(idx);
    toggleModal('gaji-modal');
}

function cetakSlipGaji(idx) {
    const m = mekanik[idx];
    if(!m.riwayat) m.riwayat = [];

    const waktuSekarang = new Date();
    const formatWaktu = waktuSekarang.toLocaleDateString('id-ID', {day: '2-digit', month:'short', year:'numeric'}) + ' ' + waktuSekarang.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});

    document.getElementById('payroll-nama-toko').innerText = setting.nama;
    document.getElementById('payroll-alamat-toko').innerText = setting.alamat;
    document.getElementById('payroll-nama-mekanik').innerText = m.nama;
    document.getElementById('payroll-waktu-cetak').innerText = formatWaktu;
    document.getElementById('payroll-total-servis').innerText = m.servis + 'x';
    document.getElementById('payroll-total-gaji').innerText = 'Rp ' + m.pendapatan.toLocaleString();

    const listItems = document.getElementById('payroll-items');
    if(m.riwayat.length === 0) {
        listItems.innerHTML = `<div>(Tidak ada rincian pengerjaan)</div>`;
    } else {
        listItems.innerHTML = m.riwayat.map(r => `
            <div class="text-[8px]">
                <div><b>${r.nopol}</b> (${r.motor})</div>
                <div class="flex justify-between"><span>${r.waktu}</span><span>Rp ${r.jasa.toLocaleString()}</span></div>
            </div>
        `).join('');
    }
    window.print();
}

function resetDataMekanik(idx) {
    if(confirm(`Yakin ingin me-reset (nol-kan) semua data kerja dan gaji dari mekanik "${mekanik[idx].nama}"?`)) {
        mekanik[idx].servis = 0;
        mekanik[idx].pendapatan = 0;
        mekanik[idx].riwayat = [];
        localStorage.setItem('otopos_mekanik', JSON.stringify(mekanik));
        renderMekanik();
        toggleModal('gaji-modal');
        alert('Data berhasil di-reset!');
    }
}

// ---------------------------------------------------------
// FUNGSI BARU UNTUK LAPORAN PENJUALAN & STOK
// ---------------------------------------------------------
function catatRiwayatStok(nama, jenis, qty, ket) {
    if(qty <= 0) return;
    riwayatStok.push({ waktu: new Date().toLocaleString('id-ID'), nama: nama, jenis: jenis, qty: qty, keterangan: ket });
    localStorage.setItem('otopos_riwayat_stok', JSON.stringify(riwayatStok));
}

function generateLaporan() {
    let totalJual = riwayatTransaksi.reduce((sum, t) => sum + t.total, 0);
    let totalJasa = mekanik.reduce((sum, m) => sum + m.pendapatan, 0);
    let totalItem = riwayatStok.filter(s => s.jenis === 'Keluar').reduce((sum, s) => sum + s.qty, 0);

    document.getElementById('lap-total-jual').innerText = 'Rp ' + totalJual.toLocaleString();
    document.getElementById('lap-total-jasa').innerText = 'Rp ' + totalJasa.toLocaleString();
    document.getElementById('lap-total-item').innerText = totalItem + ' Pcs';

    document.getElementById('list-lap-mekanik').innerHTML = mekanik.map(m => `<div class="bg-white border p-2 rounded flex justify-between"><span class="font-bold text-gray-700">${m.nama}</span><span class="text-emerald-600 font-black">Rp ${m.pendapatan.toLocaleString()}</span></div>`).join('');

    const listT = document.getElementById('list-lap-transaksi');
    listT.innerHTML = riwayatTransaksi.length === 0 ? '<p class="text-center text-gray-400 py-2">Belum ada transaksi</p>' : riwayatTransaksi.slice().reverse().map(t => `<div class="flex justify-between border-b pb-1"><div><p class="font-bold">${t.waktu} <span class="text-[9px] bg-red-100 text-red-600 px-1 rounded font-black">${t.tipe.toUpperCase()}</span></p><p class="text-gray-500">${t.items.length} macam item</p></div><div class="text-right"><p class="font-black text-blue-600">Rp ${t.total.toLocaleString()}</p><p class="text-gray-400">${t.pembayaran}</p></div></div>`).join('');

    const listS = document.getElementById('list-lap-stok');
    listS.innerHTML = riwayatStok.length === 0 ? '<p class="text-center text-gray-400 py-2">Belum ada pergerakan stok</p>' : riwayatStok.slice().reverse().map(s => `<div class="flex justify-between border-b pb-1"><div><p class="font-bold">${s.nama}</p><p class="text-gray-500">${s.waktu} - ${s.keterangan}</p></div><span class="font-black ${s.jenis === 'Masuk' ? 'text-emerald-600' : 'text-red-600'}">${s.jenis === 'Masuk' ? '+' : '-'}${s.qty}</span></div>`).join('');
}

function resetLaporan() {
    if(confirm('Yakin hapus semua riwayat Penjualan & Stok? (Data Part dan Mekanik tetap aman)')) {
        riwayatTransaksi = []; riwayatStok = [];
        localStorage.setItem('otopos_riwayat_transaksi', JSON.stringify(riwayatTransaksi)); 
        localStorage.setItem('otopos_riwayat_stok', JSON.stringify(riwayatStok));
        generateLaporan();
    }
}
// ---------------------------------------------------------

function tambahMekanik() { const nama = prompt('Nama Mekanik Baru:'); if(nama){ mekanik.push({nama, servis:0, pendapatan:0, riwayat:[]}); localStorage.setItem('otopos_mekanik', JSON.stringify(mekanik)); renderMekanik(); } }
function loadSetting() { document.getElementById('setting-nama').value=setting.nama; document.getElementById('setting-alamat').value=setting.alamat; document.getElementById('setting-telp').value=setting.telp; document.getElementById('setting-footer').value=setting.footer; document.getElementById('nama-toko-header').innerText=setting.nama; }
function simpanSettingToko() { setting.nama=document.getElementById('setting-nama').value; setting.alamat=document.getElementById('setting-alamat').value; setting.telp=document.getElementById('setting-telp').value; setting.footer=document.getElementById('setting-footer').value; localStorage.setItem('otopos_setting_toko', JSON.stringify(setting)); loadSetting(); alert('Tersimpan!'); }
function exportBackup() { const data = {parts, mekanik, setting, riwayatTransaksi, riwayatStok}; const blob = new Blob([JSON.stringify(data)], {type: 'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'otopos-backup.json'; a.click(); }