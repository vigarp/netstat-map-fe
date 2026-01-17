const map = L.map('map', {
    center: [0, 0],
    zoom: 2,
    maxBounds: [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0,
    worldCopyJump: false
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let outageData = {};

fetch(`${import.meta.env.VITE_API_URL}/aggregate-data`, {
    headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_APP_TOKEN}`
    }
})
    .then(response => response.json())
    .then(data => {
        outageData = data.countries;
        return fetch('/countries.geojson');
    })
    .then(response => response.json())
    .then(geoData => {
        L.geoJSON(geoData, {
            style: function(feature) {
                const code = feature.properties["ISO3166-1-Alpha-2"];
                const status = outageData[code]?.status || 'UNKNOWN';
                let color = 'gray';
                let fillOpacity = 0.5;
                if (status === 'OUTAGE') {
                    color = 'red';
                } else if (status === 'NORMAL') {
                    fillOpacity = 0; // No fill for normal
                }
                return { color, fillColor: color, weight: 1, fillOpacity };
            },
            onEachFeature: function(feature, layer) {
                const code = feature.properties["ISO3166-1-Alpha-2"];
                const country = outageData[code];
                let tooltip = `${feature.properties.name}<br>Status: ${country?.status || 'UNKNOWN'}`;
                if (country?.status === 'OUTAGE') {
                    tooltip += `<br>Cause: ${country.cause}<br>Since: ${new Date(country.since).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
                }
                layer.bindTooltip(tooltip);
                layer.unbindPopup(); // Disable popup on click
            }
        }).addTo(map);

        // Populate table
        const tableDiv = document.getElementById('table');
        const outages = Object.entries(outageData).filter(([code, data]) => data.status === 'OUTAGE');
        if (outages.length > 0) {
            let html = '<h2 class="text-xl font-bold mb-2">Outage Countries</h2><table class="table-auto w-full border-collapse border border-gray-300"><thead><tr class="bg-gray-200"><th class="border border-gray-300 px-4 py-2">Country</th><th class="border border-gray-300 px-4 py-2">Status</th><th class="border border-gray-300 px-4 py-2">Cause</th><th class="border border-gray-300 px-4 py-2">Since</th></tr></thead><tbody>';
            outages.forEach(([code, data]) => {
                const countryName = geoData.features.find(f => f.properties["ISO3166-1-Alpha-2"] === code)?.properties.name || code;
                html += `<tr><td class="border border-gray-300 px-4 py-2">${countryName}</td><td class="border border-gray-300 px-4 py-2">${data.status}</td><td class="border border-gray-300 px-4 py-2">${data.cause}</td><td class="border border-gray-300 px-4 py-2">${new Date(data.since).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td></tr>`;
            });
            html += '</tbody></table>';
            tableDiv.innerHTML = html;
        }
    })
    .catch(error => console.error('Error:', error));

map.invalidateSize();