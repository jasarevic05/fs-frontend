document.addEventListener("DOMContentLoaded", () => {
    const loading = document.getElementById("loading-screen");
    if (loading) loading.style.display = "none";
});

document.getElementById("checkBtn").onclick = async () => {
    const url = document.getElementById("urlInput").value.trim();
    const result = document.getElementById("result");

    if (!url) {
        alert("Unesite link za provjeru");
        return;
    }

    result.style.display = "block";   // ⬅️ sad se pojavljuje
    result.innerHTML = "Provjeravam...";


    try {
        const res = await fetch("https://fsociety-backend.onrender.com/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });

        const d = await res.json();
        const c = d.ai_confidence;

        if (!url) {
            result.style.display = "none";
            alert("Unesite link za provjeru");
        return;
}

        /* STATUS IKONICE */
        let icon = "❌";
        let statusClass = "status-danger";

        if (c.label === "SAFE") {
            icon = "✔";
            statusClass = "status-safe";
        } else if (c.label === "WARNING") {
            icon = "⚠";
            statusClass = "status-warning";
        }

        /* ZASTAVICA */
        const flag = d.geoip.countryCode
            ? `https://flagcdn.com/w40/${d.geoip.countryCode.toLowerCase()}.png`
            : "";

        const domainAge =
            d.domain_age_days === -1 ? "Nepoznata" : d.domain_age_days + " dana";

        const vtSafe =
            d.virustotal.safe === null
                ? "Nepoznato"
                : d.virustotal.safe ? "Da" : "Ne";

        result.innerHTML = `
            <h3 class="${statusClass}">
                ${icon} ${c.label} – ${c.risk}
            </h3>

            <div class="progress">
                <div class="progress-bar ${
                    c.label === "SAFE" ? "safe" :
                    c.label === "WARNING" ? "warning" : "danger"
                }" style="width:${c.confidence}%">
                    ${c.confidence}%
                </div>
            </div>

            <p><b>AI objašnjenje:</b><br>${d.ai_summary}</p>

            <details open>
                <summary>🌍 GeoIP informacije</summary>
                <p>
                    ${flag ? `<img class="flag" src="${flag}">` : ""}
                    <b>Država:</b> ${d.geoip.country}
                </p>
                <p><b>Grad:</b> ${d.geoip.city}</p>
                <p><b>ISP:</b> ${d.geoip.isp}</p>
                <p><b>ASN:</b> ${d.geoip.asn}</p>
                <p><b>VPN / Proxy:</b> ${d.geoip.proxy ? "DA" : "NE"}</p>
                <p><b>Hosting:</b> ${d.geoip.hosting ? "DA" : "NE"}</p>
                <p><b>TOR Exit Node:</b> ${d.tor_exit_node ? "DA ❌" : "NE ✔"}</p>
            </details>

            <details>
                <summary>🛡 Sigurnosne provjere</summary>
                <p><b>Sigurnosni skor (1–10):</b> ${d.security_score_1_10}</p>
                <p><b>Razlozi:</b> ${d.reasons.join(", ")}</p>
                <p><b>Starost domene:</b> ${domainAge}</p>
                <p><b>VirusTotal Safe:</b> ${vtSafe}</p>
                <p><b>VT (malicious / suspicious):</b>
                    ${d.virustotal.malicious} / ${d.virustotal.suspicious}
                </p>
            </details>

            <details>
                <summary>🔗 Tehnički detalji</summary>
                <p><b>Originalni URL:</b><br>${d.original_url}</p>
                <p><b>Konačni URL:</b><br>${d.final_url}</p>
                <p><b>Domena:</b> ${d.domain}</p>
                <p><b>Hostname:</b> ${d.hostname}</p>
                <p><b>IP adresa:</b> ${d.ip_address}</p>
            </details>
        `;
    } catch (err) {
        result.innerHTML = `<span style="color:red">Greška: ${err.message}</span>`;
    }
};
