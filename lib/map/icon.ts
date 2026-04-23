import L from "leaflet";

export function createPlaceMarkerIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="width:36px;height:44px;position:relative;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 44" width="36" height="44">
          <filter id="shadow" x="-30%" y="-10%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)"/>
          </filter>
          <path d="M18 2C10.3 2 4 8.3 4 16c0 11.2 14 26 14 26S32 27.2 32 16C32 8.3 25.7 2 18 2z"
            fill="white" stroke="#3b82f6" stroke-width="2.5" filter="url(#shadow)"/>
          <circle cx="18" cy="16" r="5" fill="#3b82f6"/>
        </svg>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -46],
  });
}

export function createMarkerIcon(isOpen: boolean) {
  const color = isOpen ? "#22c55e" : "#ef4444";
  const ripple = isOpen
    ? `<style>@keyframes ripple{0%{transform:scale(1);opacity:.5}100%{transform:scale(2.4);opacity:0}}</style>
       <div style="position:absolute;top:16px;left:18px;transform:translate(-50%,-50%);width:28px;height:28px;border-radius:50%;border:2px solid ${color};animation:ripple 2s ease-out infinite;pointer-events:none;"></div>`
    : "";

  return L.divIcon({
    className: "",
    html: `
      <div style="width:36px;height:44px;position:relative;">
        ${ripple}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 44" width="36" height="44" style="position:relative;z-index:1;">
          <filter id="shadow-${isOpen ? "open" : "closed"}" x="-30%" y="-10%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)"/>
          </filter>
          <path d="M18 2C10.3 2 4 8.3 4 16c0 11.2 14 26 14 26S32 27.2 32 16C32 8.3 25.7 2 18 2z"
            fill="white" stroke="${color}" stroke-width="2.5" filter="url(#shadow-${isOpen ? "open" : "closed"})"/>
          <circle cx="18" cy="16" r="5" fill="${color}"/>
        </svg>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -46],
  });
}
