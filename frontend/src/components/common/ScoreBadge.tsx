import React from "react";
import { getScoreColor} from "../../utils";
import type { ScoreRef } from "../../utils";

export const ScoreBadge: React.FC<ScoreRef> = ({value, refValue}) => {
  const color = getScoreColor(value, refValue);

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
