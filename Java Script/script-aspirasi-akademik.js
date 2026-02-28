const CSV_QUESTIONS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ47-M2aesh1b4lVS5e3A0-NkClJUKxYimO_16nCVnZrQNQMycGC6Mkjns4k6CrPO8z0KJc3HfMl8x-/pub?gid=348291751&single=true&output=csv"; 
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby6mHtDJ8vk-XTkn6WYcRPEYj8YFYIeHt47Il8gjlh3VI8Jw3VK405-WhFQGwWEelTqZA/exec";

document.addEventListener('DOMContentLoaded', async () => {
    const wrapper = document.getElementById('questionsWrapper');
    const displayKategori = document.getElementById('displayKategori');

    // 1. Ambil Kategori secara dinamis
    const kategoriTerpilih = localStorage.getItem('selectedKategori') || 'Kebijakan Sekolah';
    if (displayKategori) {
        displayKategori.innerText = `Kategori: ${kategoriTerpilih}`;
    }

    wrapper.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div class="fas fa-circle-notch fa-spin" style="font-size: 2rem; color: #6c5ce7;"></div>
            <p style="margin-top: 15px; color: #666;">Sedang menyiapkan sistem...</p>
        </div>`;

    try {
        // PERBAIKAN POIN 3: Kirim parameter ?kat agar status tidak tertukar
        const checkTime = await fetch(`${SCRIPT_URL}?kat=${encodeURIComponent(kategoriTerpilih)}`);
        const timeStatus = await checkTime.json();

        if (!timeStatus.isOpen) {
            wrapper.innerHTML = `
                <div class="empty-state" style="text-align:center; padding: 50px 20px;">
                    <i class="fas fa-clock" style="font-size: 3rem; color: #ff9f43; margin-bottom: 20px;"></i>
                    <p style="font-size: 1.1rem; font-weight: 600;">${timeStatus.pesan}</p>
                </div>`;
            document.getElementById('submitBtn').style.display = 'none';
            return;
        }

        // PERBAIKAN POIN 4: Ambil Pertanyaan dari CSV_QUESTIONS_URL (Bukan SCRIPT_URL)
        const response = await fetch(CSV_QUESTIONS_URL);
        const csvText = await response.text();
        
        // Parsing CSV (Menangani koma dan baris kosong)
        const rows = csvText.split(/\r?\n/).filter(row => row.trim() !== "").map(row => row.split(','));
        const headers = rows[0].map(h => h.trim().toLowerCase()); 
        
        const questions = rows.slice(1).map(row => {
            let obj = {};
            row.forEach((cell, i) => { 
                if(headers[i]) obj[headers[i]] = cell.replace(/^"|"$/g, '').trim(); 
            });
            return obj;
        }).filter(q => q.pernyataan); 

        if (questions.length === 0) {
            wrapper.innerHTML = `<div class="empty-state"><p>Tidak ada pernyataan ditemukan.</p></div>`;
            document.getElementById('submitBtn').style.display = 'none';
        } else {
            renderQuestions(questions);
            document.getElementById('submitBtn').style.display = 'block';
        }

    } catch (e) {
        console.error(e);
        wrapper.innerHTML = `<div class="empty-state"><p>Gagal memuat sistem. Cek koneksi atau URL CSV.</p></div>`;
    }
});

// Fungsi renderQuestions dan onsubmit tetap sama seperti sebelumnya
function renderQuestions(questions) {
    const wrapper = document.getElementById('questionsWrapper');
    wrapper.innerHTML = "";
    questions.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.innerHTML = `
            <span class="question-text">${index + 1}. ${q.pernyataan}</span> 
            <div class="star-rating">
                <input type="radio" id="star5-${index}" name="rating-${index}" value="5" required><label for="star5-${index}"><i class="fas fa-star"></i></label>
                <input type="radio" id="star4-${index}" name="rating-${index}" value="4"><label for="star4-${index}"><i class="fas fa-star"></i></label>
                <input type="radio" id="star3-${index}" name="rating-${index}" value="3"><label for="star3-${index}"><i class="fas fa-star"></i></label>
                <input type="radio" id="star2-${index}" name="rating-${index}" value="2"><label for="star2-${index}"><i class="fas fa-star"></i></label>
                <input type="radio" id="star1-${index}" name="rating-${index}" value="1"><label for="star1-${index}"><i class="fas fa-star"></i></label>
            </div>
            <p style="font-size:0.85rem; margin-bottom:5px; font-weight:600;">Alasan/Masalah (Min. 10 Karakter):</p>
            <textarea class="reason-box" name="reason-${index}" rows="2" placeholder="Jelaskan secara detail..." required></textarea>
            <p style="font-size:0.85rem; margin-top:10px; margin-bottom:5px; font-weight:600; color:#28a745;">Solusi/Saran Anda (Min. 10 Karakter):</p>
            <textarea class="reason-box" name="solution-${index}" rows="2" style="border-color:#28a745; background:#fafffa" placeholder="Apa saran perbaikan dari Anda?" required></textarea>
            <input type="hidden" name="question-${index}" value="${q.pernyataan}">
        `;
        wrapper.appendChild(card);
    });
}

document.getElementById('aspirasiForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const formData = new FormData(e.target);
    const results = [];
    
    let i = 0;
    while (formData.has(`question-${i}`)) {
        const rating = formData.get(`rating-${i}`);
        const alasan = formData.get(`reason-${i}`).trim();
        const solusi = formData.get(`solution-${i}`).trim();

        if (!rating || alasan.length < 10 || solusi.length < 10) {
            Swal.fire('Belum Lengkap', 'Pastikan semua rating terisi dan alasan/solusi minimal 10 karakter.', 'warning');
            return;
        }

        results.push({
            pertanyaan: formData.get(`question-${i}`),
            rating: rating,
            alasan: alasan,
            solusi: solusi
        });
        i++;
    }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
    btn.disabled = true;

    const payload = {
        nis: localStorage.getItem('userNIS') || "0000",
        nama: localStorage.getItem('userName') || "Guest",
        kategori: localStorage.getItem('selectedKategori') || "Kebijakan Sekolah",
        timestamp: new Date().toLocaleString('id-ID'),
        data: results
    };

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const resultText = await response.text();

        if (resultText === "ALREADY_SUBMITTED") {
            Swal.fire('Akses Ditolak', 'NIS Anda sudah pernah mengisi kategori ini.', 'warning').then(() => window.location.href = 'beranda.html');
        } else {
            Swal.fire('Berhasil!', 'Aspirasi Anda telah diterima.', 'success').then(() => window.location.href = 'beranda.html');
        }
    } catch (err) {
        Swal.fire('Error', 'Gagal mengirim data.', 'error');
        btn.disabled = false;
        btn.innerText = "Kirim Semua Aspirasi";
    }
};