import { useState, useEffect } from 'react';
import './App.css';

const rows = 10;
const cols = 10;

function Square({ back }) {
  return (
    <button
      className="square"
      style={{ backgroundColor: back }}
    >
    </button>
  );
}

const randomNumberInRange = (min, max) => {
  return Math.floor(Math.random()
      * (max - min + 1)) + min;
};

function Board({ rows, cols }) { 
  const initialSnake = [{ row: 0, col: 0, dir: 'r' }];
  const [snake, setSnake] = useState(initialSnake);
  const [gameOver, setGameOver] = useState(false);
  const [isApple, setIsApple] = useState(false);
  const [apple, setApple] = useState({ row: randomNumberInRange(0, rows - 1), col: randomNumberInRange(0, cols - 1) });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  useEffect(() => { // creating and eating the apple
    const head = snake[0];
    if (head.row === apple.row && head.col === apple.col) {
      setScore((prevScore) => {
        const newScore = prevScore + 100;
        setHighScore((prevHighScore) => Math.max(prevHighScore, newScore));
        return newScore;
      });
      const tail = snake[snake.length - 1];
      let newSegment;
      if (tail.dir === 'u') {
        newSegment = { row: tail.row + 1, col: tail.col, dir: tail.dir };
      } else if (tail.dir === 'd') {
        newSegment = { row: tail.row - 1, col: tail.col, dir: tail.dir };
      } else if (tail.dir === 'l') {
        newSegment = { row: tail.row, col: tail.col + 1, dir: tail.dir };
      } else if (tail.dir === 'r') {
        newSegment = { row: tail.row, col: tail.col - 1, dir: tail.dir };
      }
      setSnake((prevSnake) => [...prevSnake, newSegment]);
  
      let newApple;
      do {
        newApple = {
          row: randomNumberInRange(0, rows - 1),
          col: randomNumberInRange(0, cols - 1),
        };
      } while (snake.some((segment) => segment.row === newApple.row && segment.col === newApple.col));
      setApple(newApple);
    }
  }, [snake, apple]);

  useEffect(() => { //changing the direction of the head of the snake when you press wasd
    const handleKeyDown = (event) => {
      if (gameOver) {
        setScore(0);
        setGameOver(false);
        setSnake([{row: 0, col: 0, dir: 'r'}]);
        return;
      }
      else {
        setSnake((prevSnake) => {
          const head = prevSnake[0];
          let newDir = head.dir; 
  
          if (event.key === 'w' && head.dir !== 'd') newDir = 'u'; 
          if (event.key === 's' && head.dir !== 'u') newDir = 'd'; 
          if (event.key === 'a' && head.dir !== 'r') newDir = 'l'; 
          if (event.key === 'd' && head.dir !== 'l') newDir = 'r'; 
  
          return [{ ...head, dir: newDir }, ...prevSnake.slice(1)];
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameOver]);


  useEffect(() => { //checking if you die
    const head = snake[0];
    if (
      (head.row < 0 || 
      head.col < 0 || 
      head.row >= rows || 
      head.col >= cols)
      ||
      snake.some((segment, index) => {
        if (index != 0 && segment.row == head.row && segment.col == head.col) return true;
        return false;
      })
    ) {
      setGameOver(true); 
    }
  }, [snake]); 


  useEffect(() => {  //moving the snake
    if (gameOver) {
      console.log("game over");
      return; 
    }

    const interval = setInterval(() => {
      let nextSnake = snake.map((segment, index) => {
        if (index === 0) {
          const nextRow = segment.dir === 'd' ? segment.row + 1 : segment.dir === 'u' ? segment.row - 1 : segment.row;
          const nextCol = segment.dir === 'r' ? segment.col + 1 : segment.dir === 'l' ? segment.col - 1 : segment.col;
          return { ...segment, row: nextRow, col: nextCol };
        }
        else {
          const prevSegment = snake[index-1];
          return { ...segment, row: prevSegment.row, col: prevSegment.col, dir: prevSegment.dir };
        }
      });
      setSnake(nextSnake);
      
    }, 250);

    return () => clearInterval(interval);
  }, [gameOver, snake]);
  
  
  const board = Array.from({ length: rows * cols }, (_, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const isSnake = snake.some((segment) => segment.row === row && segment.col === col);
    const isApple = apple.row == row && apple.col == col;
    return <Square key={i} back={isSnake ? 'green' :  isApple? 'red': 'yellow'} />;
  });

  return (
    <>
    <div>
      <h1 className = 'center'>High Score: {highScore}</h1>
      <h1 className = 'center'>Score: {score}</h1>
    </div>
    {gameOver && (
      <div className="game-over-message">
        <h2>Game Over!</h2>
        <p>Press any key to restart</p>
      </div>
    )}
    <div
      className="board"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`
      }}
    >
      {board}
    </div>
    </>
  );
}

function App() {
  return (
    <div>
      <h1 className = 'center'>Snake Game</h1>
      <Board rows={rows} cols={cols} />
    </div>
  );
}

export default App;
