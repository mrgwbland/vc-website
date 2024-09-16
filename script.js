const board = document.getElementById('board');
const info = document.getElementById('opening-name');
const gameStringDisplay = document.getElementById('game-string-value');
let currentGameString = '';

let initialBoard = [
    ['B', 'S', 'N', 'R', 'K', 'N', 'S', 'B'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['b', 's', 'n', 'k', 'r', 'n', 's', 'b']
];

const sprites = {
    'B': 'sprites/BishopW.png',
    'S': 'sprites/SergeantW.png',
    'N': 'sprites/KnightW.png',
    'R': 'sprites/RookW.png',
    'P': 'sprites/SoldierW.png',
    'K': 'sprites/RoyalPawnW.png',
    'b': 'sprites/BishopB.png',
    's': 'sprites/SergeantB.png',
    'n': 'sprites/KnightB.png',
    'r': 'sprites/RookB.png',
    'p': 'sprites/SoldierB.png',
    'k': 'sprites/RoyalPawnB.png',
};

let selectedPiece = null;
let whiteToMove = true;
let isRotated = false;
let moveHistory = []; // Stack to keep track of moves

function createBoard() {
    board.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const actualRow = isRotated ? row : 7 - row;  // When not rotated, white is at the bottom
            const actualCol = isRotated ? 7 - col : col;  // Flip column if rotated

            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
            square.dataset.row = actualRow;
            square.dataset.col = actualCol;
            square.addEventListener('click', () => selectSquare(actualRow, actualCol));

            const piece = initialBoard[actualRow][actualCol];
            if (piece) {
                const img = document.createElement('img');
                img.src = sprites[piece];
                img.classList.add('piece');
                square.appendChild(img);
            }

            board.appendChild(square);
        }
    }
}

function selectSquare(row, col) {
    const piece = initialBoard[row][col];

    if (selectedPiece) {
        movePiece(selectedPiece.row, selectedPiece.col, row, col);
        selectedPiece = null;
    } else if (piece && ((whiteToMove && piece === piece.toUpperCase()) || (!whiteToMove && piece === piece.toLowerCase()))) {
        selectedPiece = { row, col, piece };
    }
}

function movePiece(startRow, startCol, destRow, destCol) {
    const piece = initialBoard[startRow][startCol];
    const destPiece = initialBoard[destRow][destCol];
    if(destPiece !== '')//If moving to a square without a piece, skip this check
    {
        if ((piece === piece.toUpperCase() && destPiece === destPiece.toUpperCase()) ||
        (piece === piece.toLowerCase() && destPiece === destPiece.toLowerCase()))
        {
        return; // Cannot capture piece of the same color
        }
    }

    // Save the move to history for undo functionality
    moveHistory.push({ piece, startRow, startCol, destRow, destCol, capturedPiece: destPiece });

    // Move the piece
    initialBoard[destRow][destCol] = piece;
    initialBoard[startRow][startCol] = '';

    // Update move string
    currentGameString += piece.toUpperCase() + startRow + startCol + destRow + destCol;
    gameStringDisplay.textContent = currentGameString || 'None';

    // Switch turns
    whiteToMove = !whiteToMove;

    createBoard();
    checkOpening();
}

function undoMove() {
    if (moveHistory.length === 0) return; // No moves to undo

    const lastMove = moveHistory.pop();
    const { piece, startRow, startCol, destRow, destCol, capturedPiece } = lastMove;

    // Undo the move
    initialBoard[startRow][startCol] = piece;
    initialBoard[destRow][destCol] = capturedPiece || ''; // Restore the captured piece if there was one

    // Remove the last move from the game string
    const moveString = piece.toUpperCase() + startRow + startCol + destRow + destCol;
    currentGameString = currentGameString.slice(0, -moveString.length);
    gameStringDisplay.textContent = currentGameString || 'None';

    // Switch turns back
    whiteToMove = !whiteToMove;

    createBoard();
    checkOpening();
}

const openingsData = `
P1333;Rook Pawn Opening;White immediately takes the centre and goes for the royal pawn
P1333P6444;Classical Game
P1333P6444P3343;Classical Game, d5
P1333P6444P3343P4434P1131;Classical Game, Main line
P1333P6444P3343P6141;Classical Game, Dutch Defense
P1333P6444P3343P6646;Classical Game, Eastern Defense
P1333P6141;German Defense
P1333P6141P3343;German Defense, Standard Line
P1333P6141P3343P6646;German Defense, Standard Line, g5
P1333P6141P1121;German Defense, Bishop Variation
P1333P6141P1121P6646B0011N7251B1120P6444P3343;West Wallaby Gambit;I played this gambit in the first game I ever beat Jack and have thus named this gambit after myself
P1333P6141P1131;German Defense, Grandmaster's Gambit
P1333P6141P1131P4131;German Defense, Grandmaster's Gambit Accepted
P1636;Bishop's Opening
P1636P6656;g4: Traditional Line
P1636P6646;Tio Countergambit
P1636P6646P3646;Tio Countergambit Accepted
P1636P6646P3646B7755;Tio Countergambit Accepted, Traditional Line
P1636P6646P3646N7554;Tio Countergambit Accepted, Modern Variation
P1636P6646S0626;Tio Countergambit Declined, Sergeant Variation
P1131;Rookside Game
P1131P6141;Rookside gambit
`;

function checkOpening() {
    const openings = openingsData.trim().split('\n');
    let matchedOpening = 'None'; // Default if no match
    let matchedInfo = 'None'; // Default for opening info

    for (const line of openings) {
        if (line.trim() === '') continue; // Skip empty lines

        const parts = line.split(';');
        const sequence = parts[0]; // Move sequence
        const openingName = parts[1]; // Opening name
        const openingInfo = parts[2] || ''; // Additional opening info, if any

        // Check if the game string starts with the current sequence
        if (currentGameString.startsWith(sequence)) {
            matchedOpening = openingName;
            matchedInfo = openingInfo; // Capture additional info if available
        }
    }
    if (currentGameString === '') {        
        matchedOpening = 'Starting Position';
    }
    // Display the matched opening name and info
    document.getElementById('opening-name').textContent = `Opening: ${matchedOpening}`;
    document.getElementById('opening-info-content').textContent = matchedInfo || 'None'; // Display extra info if available
}

document.getElementById('flip-button').addEventListener('click', () => {
    isRotated = !isRotated;
    createBoard();
});

document.getElementById('reset-button').addEventListener('click', () => {
    initialBoard = [
        ['B', 'S', 'N', 'R', 'K', 'N', 'S', 'B'],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['b', 's', 'n', 'k', 'r', 'n', 's', 'b']
    ];
    currentGameString = '';// Reset everything:
    whiteToMove = true;
    moveHistory = []; 
    createBoard();
    checkOpening(); //Should always evaluate to "starting position"
    gameStringDisplay.textContent = currentGameString || 'None';
});

document.getElementById('undo-button').addEventListener('click', () => {
    undoMove();
});

// Initial board setup
createBoard();
