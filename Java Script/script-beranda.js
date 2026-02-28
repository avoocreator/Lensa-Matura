const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby6mHtDJ8vk-XTkn6WYcRPEYj8YFYIeHt47Il8gjlh3VI8Jw3VK405-WhFQGwWEelTqZA/exec"; 

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Validasi Login
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userName = localStorage.getItem('userName');
    if (!isLoggedIn) { window.location.href = 'index.html'; return; }
    document.getElementById('welcomeText').innerText = `Selamat Datang, ${userName}`;

    const statsContainer = document.querySelector('.stats-section');
    
    // 2. Skeleton Loading
    statsContainer.innerHTML = `
        <div class="section-title"><h3>Indeks Kepuasan Siswa</h3><p>Sedang mengambil data terbaru...</p></div>
        <div class="charts-grid">
            <div class="skeleton skeleton-card" style="height: 200px; background: #eee; border-radius: 20px;"></div>
            <div class="skeleton skeleton-card" style="height: 200px; background: #eee; border-radius: 20px;"></div>
        </div>`;

    try {
        const response = await fetch(`${SCRIPT_URL}?type=stats`);
        const result = await response.json();
        
        // Pastikan mengambil objek stats
        const dataUntukRender = result.stats ? result.stats : result;
        
        // 3. Render tampilan
        renderCompactDashboard(dataUntukRender);

    } catch (err) {
        console.error("Error Beranda:", err);
        statsContainer.innerHTML = `<p style="text-align:center; color:red;">Gagal memuat data statistik.</p>`;
    }

    if (typeof Swiper !== 'undefined') {
        new Swiper(".mySwiper", { loop: true, autoplay: { delay: 5000 } });
    }
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
});

function renderCompactDashboard(allStats) {
    const statsContainer = document.querySelector('.stats-section');
    
    statsContainer.innerHTML = `
        <div class="section-title">
            <h3>Indeks Kepuasan Siswa</h3>
            <p>Data rata-rata rating real-time.</p>
        </div>
        <div class="charts-grid" id="main-grid"></div>`;
    
    const mainGrid = document.getElementById('main-grid');

    // Loop per Kategori (Fasilitas, Kebijakan, Akademik)
    for (const kategori in allStats) {
        const card = document.createElement('div');
        card.className = 'chart-card'; 
        
        const pertanyaanData = allStats[kategori];
        let contentHTML = '';

        // CEK: Jika kategori ini tidak punya data pertanyaan (Kosong)
        if (Object.keys(pertanyaanData).length === 0) {
            contentHTML = `
                <div style="text-align: center; padding: 30px 10px; border: 1px dashed #ddd; border-radius: 15px; background: #fafafa;">
                    <i class="fas fa-folder-open" style="font-size: 2rem; color: #ccc; margin-bottom: 10px;"></i>
                    <p style="font-size: 0.8rem; color: #999; margin: 0;">Belum ada data aspirasi untuk kategori ini.</p>
                </div>`;
        } else {
            // Jika ada data, buat list rating-nya
            let questionsHTML = '';
            for (const teksPertanyaan in pertanyaanData) {
                const d = pertanyaanData[teksPertanyaan];
                const rataRata = (d.totalSkor / d.jumlahSuara).toFixed(1);
                const progressWidth = (rataRata / 5) * 100;

                questionsHTML += `
                    <div class="question-row" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                        <span style="font-size: 0.8rem; color: #555; flex: 1; padding-right: 10px; line-height:1.3;">${teksPertanyaan}</span>
                        <div style="display: flex; align-items: center; gap: 8px; min-width: 100px; justify-content: flex-end;">
                            <div style="width: 60px; height: 5px; background: #eee; border-radius: 10px; overflow: hidden;">
                                <div style="width: ${progressWidth}%; height: 100%; background: linear-gradient(90deg, #6a5acd, #b19cd9);"></div>
                            </div>
                            <span style="font-weight: 700; color: #6a5acd; font-size: 0.85rem;">${rataRata}</span>
                        </div>
                    </div>`;
            }
            contentHTML = `<div class="questions-list">${questionsHTML}</div>`;
        }

        card.innerHTML = `
            <h4 style="color: #6a5acd; margin-bottom: 15px; border-left: 4px solid #6a5acd; padding-left: 12px; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
               <i class="fas fa-folder"></i> ${kategori}
            </h4>
            ${contentHTML}
            <p style="font-size: 0.65rem; color: #bbb; margin-top: 15px; text-align: right; font-style: italic;">Update: Real-time via Cloud</p>
        `;
        mainGrid.appendChild(card);
    }
}

function goToAspirasi(kategori) {
    localStorage.setItem('selectedKategori', kategori);
    if (kategori === 'Fasilitas') {
        window.location.href = 'aspirasi-fasilitas.html';
    } else if (kategori === 'Kebijakan Sekolah') {
        window.location.href = 'aspirasi-tatib.html';
    } else if (kategori === 'Akademik') {
        window.location.href = 'aspirasi-akademik.html';
    } else if (kategori === 'Lingkungan') {
        window.location.href = 'aspirasi-lingkungan.html';
    } else if (kategori === 'Aktivitas') {
        window.location.href = 'aspirasi-aktivitas.html';
    } else if (kategori === 'Hubungan') {
        window.location.href = 'aspirasi-hubungan.html';
    } else if (kategori === 'Keamanan') {
        window.location.href = 'aspirasi-keamanan.html';
    }
}