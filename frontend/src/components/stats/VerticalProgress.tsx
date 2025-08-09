import React from "react"
import type {ScoreRef} from "../../utils";

const VerticalProgress: React.FC<ScoreRef> = ({ value, refValue }) => {
  const percentage = Math.min(100, Math.max(0, (value / refValue) * 100))

  return (
    <div style={{
      position: "relative",
      height: "190px",
      width: "40px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      background: "#eee",
      overflow: "hidden"
    }}>
      {/* Градиент — всегда на весь рост */}
      <div style={{
        position: "absolute",
        bottom: 0,
        height: "100%",
        width: "100%",
        background: "linear-gradient(to top, red, yellow, green, cyan)"
      }} />

      {/* Маска — обрезает градиент сверху, оставляя только процент заполнения */}
      <div style={{
        position: "absolute",
        bottom: `${percentage}%`,
        height: `${100 - percentage}%`,
        width: "100%",
        background: "#eee",
        transition: "bottom 0.3s ease-in-out"
      }} />
    </div>
  )
}

export default VerticalProgress