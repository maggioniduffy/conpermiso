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

export function createMarkerIcon(isOpen: boolean) {
  return L.divIcon({
    className: "",
    html: `
      ${
        isOpen
          ? `
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.4); opacity: 0.4; }
          }
        </style>
        <div style="
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(34,197,94,0.3) 0%, rgba(34,197,94,0) 70%);
          animation: pulse 2s infinite;
        "></div>
      `
          : ""
      }

      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <img src="/bath_pointer.png" style="
          width: 36px;
          height: 36px;
          filter: ${
            isOpen
              ? "sepia(1) hue-rotate(95deg) saturate(500%) brightness(75%) contrast(1.4)"
              : "sepia(1) hue-rotate(310deg) saturate(600%) brightness(60%) contrast(1.3)"
          };
        " />
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}
