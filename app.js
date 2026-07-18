// OTOPOS App.js
console.log("App.js dimuat");

function toggleModal(id) {
    const modal = document.getElementById(id);
    if(modal) {
        modal.classList.toggle('hidden');
    } else {
        alert("Error: Modal tidak ditemukan!");
    }
}

function openTab(id, event) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('border-blue-600', 'text-blue-600');
        b.classList.add('border-transparent', 'text-gray-500');
    });
    
    document.getElementById(id).classList.remove('hidden');
    const activeBtn = event.currentTarget;
    activeBtn.classList.remove('border-transparent', 'text-gray-500');
    activeBtn.classList.add('border-blue-600', 'text-blue-600');
}
function simpanSettingToko() {
    // Mengambil elemen dengan aman
    const elNama = document.getElementById('setting-nama');
    const elAlamat = document.getElementById('setting-alamat');
    const elTelp = document.getElementById('setting-telp');
    const elFooter = document.getElementById('setting-footer');

    // Update object setting
    if(elNama) setting.nama = elNama.value;
    if(elAlamat) setting.alamat = elAlamat.value;
    if(elTelp) setting.telp = elTelp.value;
    if(elFooter) setting.footer = elFooter.value;

    // Simpan ke LocalStorage
    localStorage.setItem('otopos_setting_toko', JSON.stringify(setting));
    
    // Update tampilan header secara langsung
    const headerNama = document.getElementById('nama-toko-header');
    if(headerNama) headerNama.innerText = setting.nama;

    alert('Data Toko Berhasil Disimpan!');
}

function loadSetting() { 
    const elNama = document.getElementById('setting-nama');
    const elAlamat = document.getElementById('setting-alamat');
    const elTelp = document.getElementById('setting-telp');
    const elFooter = document.getElementById('setting-footer');
    
    if(elNama) elNama.value = setting.nama;
    if(elAlamat) elAlamat.value = setting.alamat;
    if(elTelp) elTelp.value = setting.telp;
    if(elFooter) elFooter.value = setting.footer;
    
    const headerNama = document.getElementById('nama-toko-header');
    if(headerNama) headerNama.innerText = setting.nama;
}

// ... (sisanya isi dengan fungsi-fungsi lain yang sudah ada)