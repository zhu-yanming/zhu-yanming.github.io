(function () {
    const API_BASE = 'https://homepage-pageviews.smilingyanming.workers.dev';

    const mapContainer = document.getElementById('visitor-map');
    const totalElement = document.getElementById('pageviews-total');

    if (!mapContainer || !totalElement || typeof L === 'undefined') {
        return;
    }

    async function trackVisit() {
        try {
            await fetch(API_BASE + '/track', {
                method: 'POST',
                mode: 'cors',
                keepalive: true
            });
        } catch (error) {
            console.warn('Pageview tracking failed:', error);
        }
    }

    async function loadStats() {
        try {
            const response = await fetch(API_BASE + '/stats', {
                method: 'GET',
                mode: 'cors'
            });

            const data = await response.json();

            totalElement.textContent = Number(data.total || 0).toLocaleString();

            renderMap(data.points || []);
        } catch (error) {
            console.warn('Pageview stats loading failed:', error);
            totalElement.textContent = '--';
            renderMap([]);
        }
    }

    function renderMap(points) {
        const map = L.map('visitor-map', {
            center: [20, 0],
            zoom: 1.35,
            minZoom: 1,
            maxZoom: 4,
            zoomControl: false,
            scrollWheelZoom: false,
            dragging: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            tap: false
        });

        L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
            {
                maxZoom: 6,
                opacity: 1
            }
        ).addTo(map);

        points.forEach(function (point) {
            if (!point.lat || !point.lon) {
                return;
            }

            const radius = Math.min(3, 1 + Math.sqrt(point.count || 1));

            L.circleMarker([point.lat, point.lon], {
                radius: radius,
                color: '#1d4ed8',
                weight: 1,
                fillColor: '#3b82f6',
                fillOpacity: 0.58
            })
                .bindTooltip(
                    `${point.city || point.region || point.country || 'Unknown'}: ${point.count} views`,
                    { direction: 'top' }
                )
                .addTo(map);
        });
    }

    trackVisit();
    loadStats();
})();