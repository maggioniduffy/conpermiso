import L from "leaflet";

export function createPlaceMarkerIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            fill="#3b82f6" stroke="white" stroke-width="1.2"/>
          <circle cx="12" cy="9" r="2.5" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });
}

export function createMarkerIcon(
  isOpen: boolean | null,
  isPublic: boolean = false,
) {
  const color = isOpen === null ? null : isOpen ? "#22c55e" : "#ef4444";
  const pulse =
    isOpen === true
      ? `<style>@keyframes pulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.5);opacity:0}}</style>
       <div style="position:absolute;inset:-6px;border-radius:50%;background:radial-gradient(circle,rgba(34,197,94,.25) 0%,rgba(34,197,94,0) 70%);animation:pulse 2s infinite;pointer-events:none;"></div>`
      : "";

  const filter = color
    ? `drop-shadow(0 0 3px ${color}) drop-shadow(0 0 2px ${color}) drop-shadow(0 1px 3px rgba(0,0,0,.3))`
    : `drop-shadow(0 1px 3px rgba(0,0,0,.3))`;

  const publicBadge = isPublic
    ? `<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#4a90e2;color:white;font-size:7px;font-weight:700;padding:1px 5px;border-radius:9999px;white-space:nowrap;line-height:1.4;box-shadow:0 0 0 1.5px white;letter-spacing:0.03em;">PÚBLICO</div>`
    : "";

  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
        ${pulse}
        ${publicBadge}
        <img src="/bath_pointer.png" style="
          position: relative;
          z-index: 1;
          width: 36px;
          height: 36px;
          filter: ${filter};
        " />
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}
