import React from "react";
import "./Tile.css";

const terrainColors = {
  default: "#ffffff",
  grass: "#7cfc00",
  water: "#00bfff",
  mountain: "#a9a9a9"
};

const pieceLetters = {
  queen: "Q",
  rook: "R",
  knight: "N",
  bishop: "B",
  king: "K",
  pawn: "P"
};

function Tile({ terrain, onMouseDown, onMouseOver, onClick, piece }) {
  return (
    <div
      className="tile"
      style={{ backgroundColor: terrainColors[terrain] || "#fff" }}
      onMouseDown={onMouseDown}
      onMouseOver={onMouseOver}
      onClick={onClick}
    >
      {piece && <span className="piece-label">{pieceLetters[piece] || "?"}</span>}
    </div>
  );
}

export default Tile;
