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

// ... (sisanya isi dengan fungsi-fungsi lain yang sudah ada)