import L from "leaflet";

export function createMarkerIcon(isOpen: boolean) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
      ">
        ${
          isOpen
            ? `
          <div style="
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(34,197,94,0.35) 0%, rgba(34,197,94,0) 70%);
            animation: pulse 2s infinite;
          "></div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.3); opacity: 0.5; }
            }
          </style>
        `
            : ""
        }
        <img src="/bath_pointer.png" style="
          width: 36px;
          height: 36px;
          filter: ${isOpen ? "none" : "grayscale(1) opacity(0.5)"};
        " />
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
}
