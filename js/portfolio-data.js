// ============================================
// PORTFOLIO DATA — edit isi di sini aja.
// Jangan sentuh kode lain, ini satu-satunya file
// yang perlu kamu ubah buat ganti konten.
// ============================================
window.PORTFOLIO_DATA = {
    // Identitas yang tampil di header HUD
    identity: {
        name: "BILLAH AKTAFI",
        role: "AI & WEB ENTHUSIAST",
        location: "Jakarta Pusat, Indonesia",
        age: 30,
        tagline: "Self-taught, suka ngoprek — dari dashboard 3D sampai router AI."
    },

    // Bio singkat
    bio: "AI & web enthusiast berbasis di Jakarta Pusat. Self-taught, belajar sambil membangun proyek nyata: dashboard 3D real-time, gateway router AI multi-provider, dan otomatisasi server. Bukan graduate bootcamp — belajarnya dari terminal dan dokumentasi.",

    // Tautan sosial & kontak
    social: {
        github: "https://github.com/Aktaf404",
        linkedin: "https://www.linkedin.com/in/billah-aktafi",
        x: "",
        email: "mailto:billahaktafi96@gmail.com",
        whatsapp: ""
    },

    // Skills beserta level (% — 0-100)
    skills: [
        { name: "HTML / CSS", level: 80, color: "#00f0ff" },
        { name: "JavaScript", level: 65, color: "#00f0ff" },
        { name: "Git & Linux", level: 70, color: "#00ff66" },
        { name: "Three.js / WebGL", level: 50, color: "#ff0055" },
        { name: "Node.js", level: 40, color: "#ffaa00" },
        { name: "Python", level: 35, color: "#ffaa00" },
        { name: "Video Editing", level: 85, color: "#00ff66" },
        { name: "IT Support / Hardware", level: 80, color: "#ff0055" }
    ],

    // Kartu proyek (3D showcase). Tambah/hapus bebas.
    projects: [
        {
            title: "MINI PC HUD",
            category: "3D CYBERPUNK HUD // IOT",
            desc: "Dashboard mini PC 3D cyberpunk-style. Telemetri real-time via WebSocket (CPU, RAM, suhu, disk, jaringan) + Tailscale Funnel, live di internet 24/7.",
            tech: ["Three.js", "WebSocket", "systeminformation", "Tailscale", "systemd"],
            color: "#ff0055",
            status: "LIVE",
            link: "https://srv-01.tailb504f8.ts.net:8443",
            gh: "https://github.com/Aktaf404/minipc-3d-hud"
        },
        {
            title: "PJLP DUMP",
            category: "WEB APP // PEMERINTAHAN",
            desc: "Buku Harian Lapangan PJLP berbasis web: input laporan harian, filter per bulan/tahun, export laporan Excel (.xlsx) dengan SheetJS. Dari kerja nyata di pemerintahan.",
            tech: ["HTML", "SheetJS", "Tailwind CSS", "Docker", "Nginx"],
            color: "#00f0ff",
            status: "LIVE",
            link: "https://srv-01.tailb504f8.ts.net:8443/pjlp",
            gh: "https://github.com/Aktaf404/pjlp-dump"
        },
        {
            title: "MOTO ROAM",
            category: "LANDING PAGE // WEB",
            desc: "Landing page jurnal touring motor lintas Nusantara: kalkulator estimasi bensin & trip berdasarkan medan, galeri foto, form kontak, download GPX track.",
            tech: ["HTML", "CSS", "JavaScript", "GitHub Pages"],
            color: "#00ff66",
            status: "LIVE",
            link: "https://aktaf404.github.io",
            gh: "https://github.com/Aktaf404/aktaf404.github.io"
        },
        {
            title: "9ROUTER GATEWAY",
            category: "AI INFRA // MULTI-PROVIDER",
            desc: "Gateway AI multi-provider buat mini PC: 5 key Atria round-robin otomatis, fallback GLM 5.3 saat limit, Telegram bot gateway 24/7, monitoring token harian via cron.",
            tech: ["Node.js", "systemd", "Tailscale", "Cron"],
            color: "#ffaa00",
            status: "LIVE",
            link: "https://srv-01.tailb504f8.ts.net",
            gh: "https://github.com/Aktaf404"
        },
        {
            title: "HOMELAB MALAM",
            category: "BLOG // JEKYLL + GITHUB PAGES",
            desc: "Blog catatan oprekan homelab: Jekyll + Chirpy theme, auto-build lewat GitHub Actions. 8 post: mati lampu auto-recovery, perang port qBittorrent vs Pi-hole, 9router 5 key, bridge Muse AI, PRD akses VM via Termux, dll. Push 1 file, 2 menit live.",
            tech: ["Jekyll", "Chirpy", "GitHub Actions", "Markdown", "GitHub Pages"],
            color: "#b07bff",
            status: "LIVE",
            link: "https://aktaf404.github.io",
            gh: "https://github.com/Aktaf404/aktaf404.github.io"
        },
        {
            title: "HOUSE PLANNER",
            category: "WEB APP // 3D FLOOR PLAN",
            desc: "Denah rumah self-hosted: gambar 2D skala asli, preview 3D, satelit map, jaringan utilitas (air, listrik, pemanas), sama bill of materials yang udah dinilai harganya. Docker + PHP, live di Tailscale.",
            tech: ["Docker", "PHP", "Three.js", "MapLibre", "Tailscale"],
            color: "#00d9a3",
            status: "LIVE",
            link: "https://srv-01.tailb504f8.ts.net:8443/planner/",
            gh: "https://github.com/Aktaf404"
        }
    ],

    // Kaki halaman — ganti bebas
    footer: {
        contact: "github.com/Aktaf404",
        version: "PORTFOLIO-HUD V2.0 "
    }
};
