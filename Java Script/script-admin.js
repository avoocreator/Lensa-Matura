const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby6mHtDJ8vk-XTkn6WYcRPEYj8YFYIeHt47Il8gjlh3VI8Jw3VK405-WhFQGwWEelTqZA/exec"; 

const SPREADSHEET_URLS = {
    "Kebijakan Sekolah": "https://docs.google.com/spreadsheets/d/1DNw1ZtQDe-Euai7uoDMWqU8CxNH4brI3uZBrOY-rIxs/edit?usp=sharing",
    "Akademik": "https://docs.google.com/spreadsheets/d/1kp7ElKkRWH8H7XtOaH8zFxeDOqHparDXYbnYBi_RCP4/edit?usp=sharing",
    "Fasilitas": "https://docs.google.com/spreadsheets/d/1MwzE2y3mD9jrqU_E-Zz5gLjXEOrOgiJk0mEu65DMYQg/edit?usp=sharing",
    "Hubungan": "https://docs.google.com/spreadsheets/d/1f3VZ-rt5GXvVWd48eNBO7tbcNA6mxKHPW--sV2A8Oc8/edit?usp=sharing",
    "Keamanan": "https://docs.google.com/spreadsheets/d/1P1t_iUY29FlW_m06dpE-MqKk7Yty_jmN_d9JNajR-Qs/edit?usp=sharing",
    "Lingkungan": "https://docs.google.com/spreadsheets/d/1LDU8pseoOES30SUNZ5i1Q1PtLOISz9vMnbJJ1IBrbyQ/edit?usp=sharing",
    "Aktivitas": "https://docs.google.com/spreadsheets/d/1d30nDlUQ3xJ572xYxiL5jYpmZyL_gp9rgfc5HA9bUpQ/edit?usp=sharing",
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${SCRIPT_URL}?type=stats`);
        const result = await response.json(); // Sekarang isinya {stats: ..., logs: ...}
        
        renderAdminDashboard(result.stats);
        renderLogAsli(result.logs); // Memanggil data asli
        
    } catch (err) {
        console.error("Gagal memuat:", err);
    }
});

function renderAdminDashboard(allStats) {
    const grid = document.getElementById('adminCategoryGrid');
    grid.innerHTML = '';
    
    let totalR = 0; 
    let totalS = 0; 
    let totalQ = 0;

    for (const kategori in allStats) {
        const card = document.createElement('div');
        card.className = 'admin-cat-card';
        card.onclick = () => window.open(SPREADSHEET_URLS[kategori], '_blank');

        let jmlSuara = 0;
        for (const q in allStats[kategori]) {
            jmlSuara += allStats[kategori][q].jumlahSuara;
            totalR += allStats[kategori][q].jumlahSuara;
            totalS += (allStats[kategori][q].totalSkor / allStats[kategori][q].jumlahSuara);
            totalQ++;
        }

        card.innerHTML = `
            <i class="fas fa-file-excel"></i>
            <h4>${kategori}</h4>
            <p>${jmlSuara} Aspirasi</p>
        `;
        grid.appendChild(card);
    }

    // 1. HITUNG PERSENTASE KEPUASAN (Skala 5 ke Skala 100)
    const rerataFinal = (totalS / totalQ || 0);
    const persentaseKepuasan = (rerataFinal / 5 * 100).toFixed(0);

    // 2. TENTUKAN LABEL & WARNA STATUS
    let statusTeks = "";
    let statusWarna = "";

    if (rerataFinal >= 4.5) { statusTeks = "Sangat Memuaskan"; statusWarna = "#28a745"; }
    else if (rerataFinal >= 3.5) { statusTeks = "Baik"; statusWarna = "#6a5acd"; }
    else if (rerataFinal >= 2.5) { statusTeks = "Cukup"; statusWarna = "#ffc107"; }
    else { statusTeks = "Perlu Perbaikan"; statusWarna = "#dc3545"; }

    document.getElementById('totalRespon').innerText = totalR;
    document.getElementById('avgRating').innerHTML = `
        ${persentaseKepuasan}% 
        <span style="font-size: 0.8rem; display: block; color: ${statusWarna}; font-weight: bold; margin-top: 5px;">
            ${statusTeks}
        </span>
    `;
}

function renderLogAsli(dataLogs) {
    const logTable = document.getElementById('logTableBody');
    
    if (!dataLogs || dataLogs.length === 0) {
        logTable.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Menunggu aspirasi pertama masuk...</td></tr>';
        return;
    }

    logTable.innerHTML = dataLogs.map(log => `
        <tr>
            <td style="color: #718096; font-size: 0.85rem;">${log.waktu}</td>
            <td><strong style="color: #2d3748;">${log.nama}</strong></td>
            <td><span style="color: #6a5acd; font-weight: 600; font-size: 0.85rem;">${log.kat}</span></td>
            <td style="color: #4a5568; font-style: italic;">"${log.teks}"</td>
        </tr>
    `).join('');
}