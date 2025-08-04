import React from "react";
import { getScoreColor } from "../utils";

export const ScoreBadge = ({ value }: { value: number }) => {
  const color = getScoreColor(value, 15, 30);

  return (
    <span
      style={{
        color,
        fontSize: "2rem",
        fontWeight: "bold",
      }}
    >
      {value}
    </span>
  );
};
