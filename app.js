let mekanik = JSON.parse(localStorage.getItem('mekanik')) || [];

function showTab(id, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('tab-active');
        b.classList.add('text-gray-500');
    });
    el.classList.add('tab-active');
    el.classList.remove('text-gray-500');
    if(id === 'tab-mekanik') loadMekanik();
}

function bukaModalTambahMekanik() {
    document.getElementById('modal-mekanik').classList.remove('hidden');
}

function simpanMekanik() {
    const nama = document.getElementById('nama-mekanik').value;
    if (!nama) return alert('Nama wajib');
    mekanik.push({ id: Date.now(), nama, gaji: 0 });
    localStorage.setItem('mekanik', JSON.stringify(mekanik));
    loadMekanik();
    tutupModal('modal-mekanik');
    document.getElementById('nama-mekanik').value = '';
}

function loadMekanik() {
    const el = document.getElementById('list-mekanik');
    if (mekanik.length === 0) {
        el.innerHTML = '<p class="text-center text-gray-400">Belum ada data mekanik</p>';
        return;
    }
    el.innerHTML = mekanik.map(m => `
        <div class="p-3 border rounded-lg">
            <div class="flex justify-between items-center">
                <p class="font-bold">${m.nama}</p>
                <span class="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-bold">Rp ${m.gaji.toLocaleString('id-ID')}</span>
            </div>
            <p class="text-xs text-gray-500">Klik untuk detail penggajian</p>
        </div>
    `).join('');
}