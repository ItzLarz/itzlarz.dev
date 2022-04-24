function uncover(square) {
  // Uncovering square with it's  value
  square.covered = false;

  switch (square.value) {
    case 0:
      whiteSquare(square);
      break;

    case 1:
      image(square1, square.rawx, square.rawy, boxSize, boxSize);
      break;

    case 2:
      image(square2, square.rawx, square.rawy, boxSize, boxSize);
      break;

    case 3:
      image(square3, square.rawx, square.rawy, boxSize, boxSize);
      break;

    case 4:
      image(square4, square.rawx, square.rawy, boxSize, boxSize);
      break;

    case 5:
      image(square5, square.rawx, square.rawy, boxSize, boxSize);
      break;

    case 6:
      image(square6, square.rawx, square.rawy, boxSize, boxSize);
      break;

    case 7:
      image(square7, square.rawx, square.rawy, boxSize, boxSize);
      break;

    case 8:
      image(square8, square.rawx, square.rawy, boxSize, boxSize);
      break;

    case null:
      image(squareMine, square.rawx, square.rawy, boxSize, boxSize);
      break;
  }
}

function whiteSquare(square) {
  // If it's a square with no bombs around it

  uncoverList = [];
  uncoverList.push(square);
  let length = 1;
  let newLength = 0;
  while (newLength != length) {
    length = uncoverList.length;
    for (i = 0; i < length; i++) {
      uncoverSurrounding(uncoverList[i]);
    }
    uncoverList = [...new Set(uncoverList)];
    newLength = uncoverList.length;
  }

  for (i = 0; i < uncoverList.length; i++) {
    if (uncoverList[i].marked) {
      uncoverList[i].marked = false;
      bombCount++

      textAlign(CENTER);
      textSize(columns);
      strokeWeight(0);
      fill(200);
      rect(edgeSize + (boxSize * columns) / 6, (topBorderSize + edgeSize) / 1.5, columns * 5, topBorderSize - topBorderSize / 1.55);
      fill(0);
      text(bombCount, edgeSize + (boxSize * columns) / 6, (topBorderSize + edgeSize) / 1.4);
      textAlign(LEFT);
    }

    uncoverList[i].covered = false;

    switch (uncoverList[i].value) {
      case 0:
        image(square0, uncoverList[i].rawx, uncoverList[i].rawy, boxSize, boxSize);
        break;

      case 1:
        image(square1, uncoverList[i].rawx, uncoverList[i].rawy, boxSize, boxSize);
        break;

      case 2:
        image(square2, uncoverList[i].rawx, uncoverList[i].rawy, boxSize, boxSize);
        break;

      case 3:
        image(square3, uncoverList[i].rawx, uncoverList[i].rawy, boxSize, boxSize);
        break;

      case 4:
        image(square4, uncoverList[i].rawx, uncoverList[i].rawy, boxSize, boxSize);
        break;

      case 5:
        image(square5, uncoverList[i].rawx, uncoverList[i].rawy, boxSize, boxSize);
        break;

      case 6:
        image(square6, uncoverList[i].rawx, uncoverList[i].rawy, boxSize, boxSize);
        break;

      case 7:
        image(square7, uncoverList[i].rawx, uncoverList[i].rawy, boxSize, boxSize);
        break;

      case 8:
        image(square8, uncoverList[i].rawx, uncoverList[i].rawy, boxSize, boxSize);
        break;
    }
  }
}

function uncoverSurrounding(square) {
  // Uncovering the squares surrounding the empty square
  if (square.value == 0) {
    // Upper left corner
    if (square.col == 0 && square.row == 0) {
      uncoverList.push(squares[0][1]);
      uncoverList.push(squares[1][0]);
      uncoverList.push(squares[1][1]);
    }

    // Upper right corner
    else if (square.col == columns - 1 && square.row == 0) {
      uncoverList.push(squares[columns - 2][0]);
      uncoverList.push(squares[columns - 1][1]);
      uncoverList.push(squares[columns - 2][1]);
    }

    // Bottom left corner
    else if (square.col == 0 && square.row == rows - 1) {
      uncoverList.push(squares[0][rows - 2]);
      uncoverList.push(squares[1][rows - 1]);
      uncoverList.push(squares[1][rows - 2]);
    }

    // Bottom right corner
    else if (square.col == columns - 1 && square.row == rows - 1) {
      uncoverList.push(squares[columns - 1][rows - 2]);
      uncoverList.push(squares[columns - 2][rows - 1]);
      uncoverList.push(squares[columns - 2][rows - 2]);
    }

    // Left wall
    else if (square.col == 0 && square.row != 0) {
      uncoverList.push(squares[square.col][square.row - 1]);
      uncoverList.push(squares[square.col + 1][square.row - 1]);
      uncoverList.push(squares[square.col + 1][square.row]);
      uncoverList.push(squares[square.col + 1][square.row + 1]);
      uncoverList.push(squares[square.col][square.row + 1]);
    }

    // Right wall
    else if (square.col == columns - 1 && square.row != 0) {
      uncoverList.push(squares[square.col][square.row - 1]);
      uncoverList.push(squares[square.col - 1][square.row - 1]);
      uncoverList.push(squares[square.col - 1][square.row]);
      uncoverList.push(squares[square.col - 1][square.row + 1]);
      uncoverList.push(squares[square.col][square.row + 1]);
    }

    // Upper wall
    else if (square.col != 0 && square.row == 0) {
      uncoverList.push(squares[square.col - 1][square.row]);
      uncoverList.push(squares[square.col - 1][square.row + 1]);
      uncoverList.push(squares[square.col][square.row + 1]);
      uncoverList.push(squares[square.col + 1][square.row + 1]);
      uncoverList.push(squares[square.col + 1][square.row]);
    }

    // Bottom wall
    else if (square.col != 0 && square.row == rows - 1) {
      uncoverList.push(squares[square.col - 1][square.row]);
      uncoverList.push(squares[square.col - 1][square.row - 1]);
      uncoverList.push(squares[square.col][square.row - 1]);
      uncoverList.push(squares[square.col + 1][square.row - 1]);
      uncoverList.push(squares[square.col + 1][square.row]);
    }

    // Rest of the squares
    else if (square.col < columns && square.row < rows) {
      uncoverList.push(squares[square.col - 1][square.row]);
      uncoverList.push(squares[square.col - 1][square.row - 1]);
      uncoverList.push(squares[square.col][square.row - 1]);
      uncoverList.push(squares[square.col + 1][square.row - 1]);

      uncoverList.push(squares[square.col + 1][square.row]);
      uncoverList.push(squares[square.col + 1][square.row + 1]);
      uncoverList.push(squares[square.col][square.row + 1]);
      uncoverList.push(squares[square.col - 1][square.row + 1]);
    }
  }
}