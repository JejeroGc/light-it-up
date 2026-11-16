import type { CSSProperties } from "react";

export const itemStyle = (selected: boolean): CSSProperties => ({
  width: "100%", padding: "9px 10px", marginBottom: 6, textAlign: "left",
  background: selected ? "#332a12" : "#1f1f1f",
  color: selected ? "#ffd36a" : "white",
  border: selected ? "1px solid #ffd36a" : "1px solid #333",
  borderRadius: 6, cursor: "pointer",
});

export const secondaryButtonStyle: CSSProperties = {
  padding: "5px 8px", border: "1px solid #444", borderRadius: 5,
  background: "#292929", color: "#ddd", cursor: "pointer", fontSize: 12,
};

export const createButtonStyle = (enabled: boolean): CSSProperties => ({
  width: "100%", padding: "8px 10px", marginBottom: 8,
  cursor: enabled ? "pointer" : "not-allowed", borderRadius: 6,
  border: enabled ? "1px solid #ffd36a" : "1px solid #3a3a3a",
  background: enabled ? "#332a12" : "#202020",
  color: enabled ? "#ffd36a" : "#666", opacity: enabled ? 1 : 0.75,
});
