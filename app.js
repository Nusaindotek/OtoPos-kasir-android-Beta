function cetakStruk(total, bayar, kembali){
    const area = document.getElementById('area-struk');
    const tanggal = new Date().toLocaleString('id-ID');
    const mekanikNama = antrianAktif && antrianAktif.mekanikId? mekanik.find(m => m.id === antrianAktif.mekanikId)?.nama || '-' : '-';
    const nopol = antrianAktif? antrianAktif.nopol : 'DIRECT PART';
    let listItem = '';
    keranjang.forEach(i => { listItem += `<div class="struk-item"><span>${i.nama} ${i.tipe === 'part'? 'x'+i.qty : ''}</span><span>Rp ${(i.harga*i.qty).toLocaleString('id-ID')}</span></div>`; });
    area.innerHTML = `<div class="struk-header"><div style="font-size:14px">${setting.nama.toUpperCase()}</div><div>${setting.alamat}</div><div class="struk-line"></div></div><div>Tanggal: ${tanggal}</div><div>Nopol: ${nopol}</div><div>Mekanik: ${mekanikNama}</div><div>Mode: ${mode.toUpperCase()}</div><div class="struk-line"></div>${listItem}<div class="struk-line"></div><div class="struk-item"><span>SUBTOTAL</span><span>Rp ${total.toLocaleString('id-ID')}</span></div><div class="struk-item"><span>BAYAR</span><span>Rp ${bayar.toLocaleString('id-ID')}</span></div><div class="struk-item"><span>KEMBALI</span><span>Rp ${kembali.toLocaleString('id-ID')}</span></div><div class="struk-line"></div><div style="text-align:center">Terima Kasih</div>`;
    window.print();
}

function checkout(){
    if(keranjang.length === 0) return alert('Keranjang kosong');
    const total = keranjang.reduce((sum, i) => sum + i.harga * i.qty, 0);
    const bayar = parseInt(document.getElementById('input-bayar').value) || 0;
    if(bayar < total) return alert('Uang bayar kurang!');
    const kembali = bayar - total;
    cetakStruk(total, bayar, kembali);
    simpanRiwayat(total, bayar, kembali);
    keranjang.filter(i => i.tipe === 'part').forEach(item => {
        const p = produk.find(x => x.id === item.id);
        if(p) p.stok -= item.qty;
    });
    localStorage.setItem('produk', JSON.stringify(produk));
    loadProduk(); loadPart();
    if(mode === 'servis' && antrianAktif){ hapusAntrian(antrianAktif.id); }
    keranjang = [];
    document.getElementById('input-bayar').value = '';
    tampilkanKeranjang();
}