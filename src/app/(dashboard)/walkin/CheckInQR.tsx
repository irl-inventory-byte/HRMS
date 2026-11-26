"use client";

import { QRCodeSVG } from "qrcode.react";

export default function CheckInQR({ url }: { url: string }) {
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ background: "#fff", padding: 12, borderRadius: 8 }}>
        <QRCodeSVG value={url} size={160} />
      </div>
      <div>
        <h4 style={{ marginBottom: 6 }}>Self check-in QR</h4>
        <p style={{ color: "var(--text-dim)", fontSize: 13 }}>
          Print this and place it at the front desk. Candidates scan it, fill the form themselves, and appear below automatically.
        </p>
        <p style={{ fontSize: 12, color: "var(--text-faint)" }}>{url}</p>
      </div>
    </div>
  );
}