// TEST VERSI SUPER SIMPEL
console.log("JS Loaded");

let produk = []; let antrian = []; let cart = []; let mode = 'servis'; let paymentMethod = 'Tunai';
let settingToko = { nama: 'Bengkel Test', alamat: 'Test', telp: '0', footer: 'Test' };

function toggleModal(id){ alert('Modal: ' + id); document.getElementById(id).classList.toggle('hidden'); }
function setMode(m, el){ alert('Mode: ' + m); }
function showTab(id, el){ alert('Tab: ' + id); }
function tambahAntrian(){ alert('Tambah Antrian'); }
function tambahKeBilling(){ alert('Tambah Billing'); }
function setPayment(m, el){ alert('Bayar: ' + m); }
function handleQuickAdd(lagi){ alert('Simpan Part'); }
function simpanSettingToko(){ alert('Simpan Setting'); }
function exportBackup(){ alert('Export'); }
function importBackup(e){ alert('Import'); }
function pilihPrinter(){ alert('Pilih Printer'); }
function prosesCheckout(){ alert('Checkout'); }
function loadProduk(){}
function loadAntrian(){}
function loadSetting(){}
function updateBilling(){}
function pilihAntrian(id){}