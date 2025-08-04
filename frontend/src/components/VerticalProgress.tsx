import React from "react"
import type {ScoreRef} from "../utils";

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


// import React from "react"

// interface VerticalProgressProps {
//   value: number // от 0 до 100
//   refValue: number
// }

// const getColor = (value: number, refValue: number): string => {
//   if (value < (refValue/3)) return "red"
//   if (value < (2*refValue/3)) return "yellow"
//   return "green"
// }

// const VerticalProgress: React.FC<VerticalProgressProps> = ({ value, refValue }) => {
//   const color = getColor(value, refValue)

//   return (
//     <div style={{
//       height: "200px",
//       width: "50px",
//       border: "1px solid #ccc",
//       borderRadius: "4px",
//       background: "#eee",
//       display: "flex",
//       alignItems: "flex-end",
//       overflow: "hidden"
//     }}>
//       <div style={{
//         height: `${value/refValue*100}%`,
//         width: "100%",
//         backgroundColor: color,
//         transition: "height 0.3s ease-in-out"
//       }} />
//     </div>
//   )
// }

// export default VerticalProgress
