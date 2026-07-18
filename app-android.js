console.log("JS Otopos Mulai Jalan");

// DATA KOSONG DULU BIAR GAK ERROR
let produk = []; 
let antrian = []; 
let cart = []; 
let mode = 'servis'; 
let paymentMethod = 'Tunai';
let settingToko = { nama: 'Bengkel Test', alamat: 'Test', telp: '0', footer: 'Test' };

// JANGAN PAKE DOMContentLoaded DULU
window.onload = function() {
    console.log("Window Loaded");
    loadProduk(); 
    loadAntrian(); 
    loadSetting(); 
    setMode('servis', document.getElementById('tab-servis')); 
    updateBilling();
}

// SEMUA FUNGSI DIJADIKAN PALING SIMPLE
function setMode(m, el) {
    mode = m;
    document.querySelectorAll('#tab-servis, #tab-part').forEach(b => { b.classList.remove('bg-red-600', 'text-white'); b.classList.add('text-gray-600'); });
    el.classList.add('bg-red-600', 'text-white');
    document.getElementById('area-servis').style.display = m === 'servis' ? 'flex' : 'none';
    document.getElementById('area-part').style.display = m === 'part' ? 'flex' : 'none';
    document.getElementById('billing-type').innerText = m === 'servis'? 'SERVIS' : 'PART';
}
function toggleModal(id) { document.getElementById(id).classList.toggle('hidden'); }
function showTab(id, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('border-blue-600', 'text-gray-900'); b.classList.add('text-gray-500'); });
    el.classList.add('border-blue-600', 'text-gray-900');
}
function tambahAntrian() { alert('Tombol Tambah Antrian Jalan'); toggleModal('antrian-modal'); }
function loadAntrian() { document.getElementById('list-antrian').innerHTML = '<p class="text-center text-gray-400">Antrian Kosong</p>'; }
function loadProduk() { document.getElementById('list-produk').innerHTML = ''; }
function tambahKeBilling() { alert('Tombol TAMBAH Jalan'); }
function updateBilling() { document.getElementById('cart-total').innerText = 'Rp 0'; }
function setPayment(m, el) { alert('Bayar: ' + m); }
function handleQuickAdd(lagi) { alert('Simpan Part'); if(!lagi) toggleModal('input-modal'); }
function simpanSettingToko() { alert('Setting Tersimpan'); }
function loadSetting() { document.getElementById('nama-toko-header').innerText = settingToko.nama; }
function exportBackup() { alert('Export'); }
function importBackup(e) { alert('Import'); }
function pilihPrinter() { alert('Fitur Printer'); }
function prosesCheckout() { alert('Checkout'); }
function pilihAntrian(id) {}
