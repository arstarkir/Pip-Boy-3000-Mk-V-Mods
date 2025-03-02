let board;
let previousBoard;
let currentPiece;
let previousPiece;
let isGameOver;
let isPaused = false;
const gridSize = 15; // indivisual tallnes lol of each square
const gridWidth = 10; // girth of the board ;]
const gridHeight = 20; // tallnes 
const offsetX = 165; // like 38 to make it not tuch the wall but i need to play around till i find the center
const offsetY = 6; // vertical offset

function createBoard() {
  let b = [];
  for (let i = 0; i < gridHeight; i++) {
    b.push(Array(gridWidth).fill(0));
  }
  return b;
}

function clearScreen() {
  g.clear();
  g.drawRect(offsetX, offsetY, offsetX + gridWidth * gridSize, offsetY + gridHeight * gridSize);
}

function drawBoard() {
  // Only update changed parts
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] !== previousBoard[y][x]) {
        if (board[y][x]) {
          g.fillRect(x * gridSize + offsetX + 1, y * gridSize + offsetY + 1, x * gridSize + offsetX + gridSize - 1, y * gridSize + offsetY + gridSize - 1);
        } else {
          g.clearRect(x * gridSize + offsetX + 1, y * gridSize + offsetY + 1, x * gridSize + offsetX + gridSize - 1, y * gridSize + offsetY + gridSize - 1);
        }
      }
    }
  }

  if (previousPiece) {
    erasePiece(previousPiece);
  }

  drawPiece(currentPiece);
  previousBoard = JSON.parse(JSON.stringify(board));
  previousPiece = JSON.parse(JSON.stringify(currentPiece));
}

function drawPiece(piece) {
  piece.shape.forEach(block => {
    g.fillRect((piece.x + block.x) * gridSize + offsetX + 1, (piece.y + block.y) * gridSize + offsetY + 1, (piece.x + block.x) * gridSize + offsetX + gridSize - 1, (piece.y + block.y) * gridSize + offsetY + gridSize - 1);
  });
}

function erasePiece(piece) {
  piece.shape.forEach(block => {
    g.clearRect((piece.x + block.x) * gridSize + offsetX + 1, (piece.y + block.y) * gridSize + offsetY + 1, (piece.x + block.x) * gridSize + offsetX + gridSize - 1, (piece.y + block.y) * gridSize + offsetY + gridSize - 1);
  });
}

function newPiece() {
  const shapes = [
    [{x:0, y:0}, {x:1, y:0}, {x:-1, y:0}, {x:0, y:-1}],  // T
    [{x:0, y:0}, {x:-1, y:0}, {x:1, y:0}, {x:2, y:0}],  // I (spawning sideways giving truble when vert)
    [{x:0, y:0}, {x:1, y:0}, {x:0, y:-1}, {x:1, y:-1}], // O
    [{x:0, y:0}, {x:-1, y:0}, {x:0, y:1}, {x:1, y:1}],  // Z
    [{x:0, y:0}, {x:1, y:0}, {x:0, y:1}, {x:-1, y:1}],  // S
  ];
  currentPiece = {
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    x: Math.floor(gridWidth / 2) - 1,
    y: 0
  };
  if (!isValidMove(currentPiece)) {
    currentPiece.y++;
    if (!isValidMove(currentPiece)) {
      closeProgram();
    }
  }
}

function rotatePiece() {
  if (currentPiece) {
    currentPiece.shape = currentPiece.shape.map(block => ({x: -block.y, y: block.x}));
    if (!isValidMove(currentPiece)) {
      currentPiece.shape = currentPiece.shape.map(block => ({x: block.y, y: -block.x}));
    }
  }
}

function movePiece(dx, dy) {
  if (currentPiece) {
    currentPiece.x += dx;
    currentPiece.y += dy;
    if (!isValidMove(currentPiece)) {
      currentPiece.x -= dx;
      currentPiece.y -= dy;
    }
  }
}

function dropPiece() {
  if (currentPiece) {
    while (isValidMove(currentPiece)) {
      currentPiece.y++;
    }
    currentPiece.y--;
    placePiece();
    newPiece();
    drawBoard();
  }
}

function isValidMove(piece) {
  return piece.shape.every(block => {
    let x = piece.x + block.x;
    let y = piece.y + block.y;
    return x >= 0 && x < gridWidth && y >= 0 && y < gridHeight && !board[y][x];
  });
}

function placePiece() {
  if (currentPiece) {
    currentPiece.shape.forEach(block => {
      let x = currentPiece.x + block.x;
      let y = currentPiece.y + block.y;
      if (board[y]) {
        board[y][x] = 1;
      }
    });
    clearLines();
  }
}

function clearLines() {
  board = board.filter(row => row.some(cell => !cell));
  while (board.length < gridHeight) {
    board.unshift(Array(gridWidth).fill(0));
  }
}

function updateGame() {
  if (isGameOver || isPaused) return;
  if (currentPiece) {
    currentPiece.y++;
    if (!isValidMove(currentPiece)) {
      currentPiece.y--;
      placePiece();
      newPiece();
    }
    drawBoard();
    if (!isValidMove(currentPiece)) {
      closeProgram();
    }
  }
}

function resetGame() {
  clearScreen(); // Clear the screen at the beginning of every game mostly heare becus the game over and the loading text just wont leave 
  board = createBoard();
  previousBoard = createBoard();
  isGameOver = false;
  isPaused = false;
  newPiece();
  drawBoard();
}

function closeProgram() {
  g.clear();
  g.drawString("Game Over", offsetX + (gridWidth * gridSize) / 2 - 40, (gridHeight * gridSize) / 2 - 10);
  isGameOver = true;
}

function pauseGame() {
  isPaused = !isPaused;
  if (!isPaused) {
    updateGame();
  }
}

function handleKnob1Change(value) {
  if (!isGameOver && !isPaused) {
    if (value === 1) {
      rotatePiece(); // Rotate piece
    } else if (value === -1) {
      dropPiece(); // Drop piece  side note: i need to see of i can make it so if i scroll the wheel it dosent keep sending the input
    }
  }
}

function handleKnob2Change(value) {
  if (!isGameOver && !isPaused) {
    if (value === 1) {
      movePiece(1, 0); // Move right
    } else if (value === -1) {
      movePiece(-1, 0); // Move left
    }
  }
}

// Inputs
setWatch(resetGame, KNOB1_BTN, {repeat:true, edge:'rising'});
setWatch(pauseGame, BTN_TORCH, {repeat:true, edge:'rising'});
Pip.on("knob1", handleKnob1Change);
Pip.on("knob2", handleKnob2Change);

setInterval(updateGame, 500);

// what came first the chiken or the egg
resetGame();
