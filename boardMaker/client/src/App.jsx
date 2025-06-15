import React, { useState, useEffect, useRef } from "react";
import Tile from "./components/Tile";
import "./App.css";

const terrainTypes = ["default", "grass", "water", "mountain"];
const pieceTypes = ["pawn", "rook", "knight", "bishop", "queen", "king"];


function App() {
  const [levelName, setLevelName] = useState("");
  const [savedLevels, setSavedLevels] = useState([]);
  const [widthInput, setWidthInput] = useState("8");
  const [heightInput, setHeightInput] = useState("8");

  const [grid, setGrid] = useState(
    Array(8)
      .fill(null)
      .map(() => Array(8).fill("default"))
  );

  const [selectedTerrain, setSelectedTerrain] = useState("grass");
  const [selectedPieceType, setSelectedPieceType] = useState(null);
  const [enemyPieces, setEnemyPieces] = useState([]);

  const [isDragging, setIsDragging] = useState(false);
  const gridRef = useRef(null);

  const resizeGrid = (newWidth, newHeight) => {
    const height = parseInt(newHeight);
    const width = parseInt(newWidth);
    if (!width || !height) return;

    const newGrid = Array(height)
      .fill(null)
      .map((_, y) =>
        Array(width)
          .fill("default")
          .map((_, x) => grid[y]?.[x] || "default")
      );

    setGrid(newGrid);
  };

  useEffect(() => {
    loadLevels();
    if (widthInput !== "" && heightInput !== "") {
      resizeGrid(widthInput, heightInput);
    }
  }, [widthInput, heightInput]);

  const handleClick = (x, y) => {
    if (selectedPieceType) {
      setEnemyPieces((prev) => {
        const updated = prev.filter((p) => p.x !== x || p.y !== y);
        return [...updated, { type: selectedPieceType, x, y }];
      });
    } else {
      const newGrid = grid.map((row, i) =>
        row.map((cell, j) => (i === y && j === x ? selectedTerrain : cell))
      );
      setGrid(newGrid);
    }
  };

  const handleMouseDown = (x, y) => {
    setIsDragging(true);
    handleClick(x, y);
  };

  const handleMouseOver = (x, y) => {
    if (isDragging && !selectedPieceType) {
      handleClick(x, y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const fillGrid = () => {
    const newGrid = grid.map((row) => row.map(() => selectedTerrain));
    setGrid(newGrid);
  };

  const downloadLevel = () => {
    const data = {
      width: grid[0].length,
      height: grid.length,
      terrain: grid,
      enemy_pieces: enemyPieces,
      level_id: `level_${Date.now()}`
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${data.level_id}.json`;
    link.click();
  };

  const saveLevelToDB = async () => {
    const payload = {
      name: levelName || `Level_${Date.now()}`,
      level_id: `level_${Date.now()}`, // ✅ Add this line
      width: grid[0].length,
      height: grid.length,
      terrain: grid,
      enemy_pieces: enemyPieces
    };

    try {
      const res = await fetch("http://localhost:5000/api/levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Level saved!");
        loadLevels(); // Refresh the level list
      } else {
        alert("Error saving level.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend.");
    }
  };


  const loadLevels = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/levels");
      const data = await res.json();
      setSavedLevels(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadLevel = async (level) => {
    try {
      const res = await fetch(`http://localhost:5000/api/levels/${level.level_id}`);
      const data = await res.json();

      // Basic validation
      if (
        !data ||
        !Array.isArray(data.terrain) ||
        data.terrain.length === 0 ||
        !Array.isArray(data.terrain[0])
      ) {
        alert("Invalid level data");
        console.log(data);
        return;
      }

      setGrid(data.terrain);
      setEnemyPieces(data.enemy_pieces || []);
      setWidthInput(String(data.width || data.terrain[0].length));
      setHeightInput(String(data.height || data.terrain.length));
    } catch (err) {
      console.error("Failed to load level:", err);
      alert("Error loading level");
    }
  };




  const columns = grid.length > 0 && grid[0] ? grid[0].length : 1;
  const rows = grid.length || 1;



  return (
    <div className="app" onMouseUp={handleMouseUp}>
      <div className="board-container">
        <div
          className="grid"
          ref={gridRef}
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`
          }}
        >


          {grid.map((row, y) =>
            row.map((terrain, x) => {
              const piece = enemyPieces.find((p) => p.x === x && p.y === y)?.type || null;
              return (
                <Tile
                  key={`${x}-${y}`}
                  terrain={terrain}
                  piece={piece}
                  onMouseDown={() => handleMouseDown(x, y)}
                  onMouseOver={() => handleMouseOver(x, y)}
                  onClick={() => handleClick(x, y)}
                />
              );
            })
          )}
        </div>
      </div>

      <div className="sidebar">
        <h1>Level Creator</h1>

        <div className="save-load-section">

          
  <h2>Save / Load</h2>

    <input
      type="text"
      placeholder="Level Name"
      value={levelName}
      onChange={(e) => setLevelName(e.target.value)}
    />
    <button onClick={saveLevelToDB}>Save to DB</button>
    <button onClick={downloadLevel}>Download JSON</button>

    <h3>Load Level</h3>
    <select
      className="dropdown"
      onChange={(e) => {
        const selectedId = e.target.value;
        const level = savedLevels.find((lvl) => lvl.level_id === selectedId);
        if (level) loadLevel(level);
      }}
      defaultValue=""
    >
      <option value="" disabled>
        Select a level...
      </option>
      {savedLevels.map((lvl) => (
        <option key={lvl.level_id} value={lvl.level_id}>
          {lvl.name || lvl.level_id}
        </option>
      ))}
    </select>
  </div>





        <div className="toolbar">
          <h2>Terrain</h2>
          {terrainTypes.map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedTerrain(type);
                setSelectedPieceType(null);
              }}
              className={selectedTerrain === type && !selectedPieceType ? "selected" : ""}
            >
              {type}
            </button>
          ))}
          <button onClick={fillGrid}>Fill All</button>
        </div>

        <div className="pieces-toolbar">
          <h2>Enemy Pieces</h2>
          {pieceTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedPieceType(type)}
              className={selectedPieceType === type ? "selected" : ""}
            >
              {type}
            </button>
          ))}
          <button onClick={() => setSelectedPieceType(null)}>Edit Terrain</button>
        </div>

        <div className="resize-controls">
          <h2>Resize</h2>
          <label>
            Width:
            <input
              type="number"
              min="0"
              value={widthInput}
              onChange={(e) => setWidthInput(e.target.value)}
            />
          </label>
          <label>
            Height:
            <input
              type="number"
              min="0"
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
            />
          </label>
        </div>

        <button onClick={downloadLevel}>Download JSON</button>
      </div>
    </div>
  );
}

export default App;
