import L from "leaflet";

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
