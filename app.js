// Show loading
const mapDiv = document.getElementById('map');
const tableDiv = document.getElementById('table');
mapDiv.innerHTML = '<div class="flex justify-center items-center h-full"><div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div><p class="mt-2 text-gray-600">Loading map...</p></div>';
tableDiv.innerHTML = '<div class="flex justify-center items-center h-full"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><p class="mt-2 text-gray-600">Loading data...</p></div>';

const map = L.map('map', {
    center: [0, 0],
    zoom: 2,
    maxBounds: [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0,
    worldCopyJump: false
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map).on('load', () => {
    // Hide loading after tiles load
    const loading = mapDiv.querySelector('.flex');
    if (loading) loading.style.display = 'none';
});

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
            let html = '<h2 class="text-lg sm:text-xl font-bold mb-2">Outage Countries</h2><table class="table-auto w-full border-collapse border border-gray-300 text-xs sm:text-sm"><thead><tr class="bg-gray-200"><th class="border border-gray-300 px-2 py-1 sm:px-4 sm:py-2">Country</th><th class="border border-gray-300 px-2 py-1 sm:px-4 sm:py-2">Status</th><th class="border border-gray-300 px-2 py-1 sm:px-4 sm:py-2">Cause</th><th class="border border-gray-300 px-2 py-1 sm:px-4 sm:py-2">Since</th></tr></thead><tbody>';
            outages.forEach(([code, data]) => {
                const countryName = geoData.features.find(f => f.properties["ISO3166-1-Alpha-2"] === code)?.properties.name || code;
                html += `<tr><td class="border border-gray-300 px-2 py-1 sm:px-4 sm:py-2">${countryName}</td><td class="border border-gray-300 px-2 py-1 sm:px-4 sm:py-2">${data.status}</td><td class="border border-gray-300 px-2 py-1 sm:px-4 sm:py-2">${data.cause}</td><td class="border border-gray-300 px-2 py-1 sm:px-4 sm:py-2">${new Date(data.since).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td></tr>`;
            });
            html += '</tbody></table>';
            tableDiv.innerHTML = html;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mapDiv.innerHTML = '<div class="flex justify-center items-center h-full"><p class="text-red-600 text-center">Failed to load map. Please check your connection and try again.</p></div>';
        tableDiv.innerHTML = '<div class="flex justify-center items-center h-full"><p class="text-red-600 text-center">Failed to load data. Please check your connection and try again.</p></div>';
    });

map.invalidateSize();

// Responsive: invalidate on resize
window.addEventListener('resize', () => {
    map.invalidateSize();
});