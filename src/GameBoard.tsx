import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useInterval } from './useInterval.js';
import eatSound from './assets/eat.mp3'
import gameOverSound from './assets/game_over_sound.mp3'
import { GameBoardProps, GameAudio, Position, GameState, config } from './GameConstants'

export function GameBoard(props: GameBoardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioRef = useRef<GameAudio>(
        {
            gameOver: new Audio(gameOverSound),
            eat: new Audio(eatSound)
        }
    )

    const [gameState, setGameState] = useState<GameState>(GameState.MENU)
    const [score, setScore] = useState<number>(0)
    const [counter, setCounter] = useState<number>(0)
    const [difficulty, setDifficulty] = useState<number>(0)
    const [food, setFood] = useState<Position>({ x: -1, y: -1 })
    const [velocity, setVelocity] = useState<Position>({ x: 0, y: 0 })
    const [snake, setSnake] = useState<Position[]>([{ x: 0, y: 0 }])

    useInterval(() => gameLoop(), config.baseSpeed - (20 * difficulty))
    useInterval(() => {
        if (gameState == GameState.RUNNING) setCounter(counter + 1)
    }, 1000)


    const placeSnake = () => {
        snake.forEach((pos: Position) => {
            if (pos.x < 0) {
                pos.x = props.width / config.scale - 1
            }

            if (pos.x >= props.width / config.scale) {
                pos.x = 0
            }

            if (pos.y < 0) {
                pos.y = props.height / config.scale - 1
            }

            if (pos.y >= props.height / config.scale) {
                pos.y = 0
            }
            drawRect(pos, 1, 1, 'limegreen')
        });
    }

    const placeFood = () => {
        drawRect(food, 1, 1, "orange")
    }

    const createFoodPosition = () => {
        let collision: boolean;
        let foodPos: Position;

        do {
            collision = false
            foodPos = getRandomPosition()
            for (const pos of snake) {
                if (collapeses(foodPos, pos)) {
                    collision = true
                    break;
                }
            }
        } while (collision)


        setFood(foodPos)
    }

    const drawText = (text: string, position: Position, size: number = 50, color: string = "lime") => {
        const context = canvasRef.current?.getContext('2d')
        if (context) {
            context.fillStyle = color;
            context.textAlign = 'center';
            context.font = `${size}px Roboto Mono`;
            context.fillText(text, position.x, position.y);
        }
    }

    const drawRect = (position: Position, width: number, height: number, color: string = 'black') => {
        const context = canvasRef.current?.getContext('2d')
        if (context) {
            context.fillStyle = color
            context.fillRect(position.x, position.y, width, height)
        }
    }

    const hud = () => {
        drawText(`Score: ${score}`, { x: props.width / 2 / config.scale, y: 1 }, 15 / config.scale)
        drawText(`Timer: ${counter}`, { x: props.width / 2 / config.scale, y: 2 }, 15 / config.scale)
        drawText(`Level: ${difficulty}`, { x: props.width / 2 / config.scale, y: 3 }, 15 / config.scale)
    }

    const startScreen = () => {
        const midPosition = { x: props.width / 2 / config.scale, y: props.height / 2 / config.scale }

        drawText(`Welcome!`, { ...midPosition, y: midPosition.y - 3 }, 1)
        drawText(`Press "s" to start new game`, { ...midPosition, y: midPosition.y }, 1)
        drawText(`Press "+" or "-" to change difficulty`, { ...midPosition, y: midPosition.y + 2 }, 1)
    }

    const pauseScreen = () => {
        const midPosition = { x: props.width / 2 / config.scale, y: props.height / 2 / config.scale }
        drawText(`Paused!`, { ...midPosition, y: midPosition.y - 3 }, 2)
        drawText(`Your score: ${score}`, { ...midPosition, y: midPosition.y }, 1)
    }

    const gameOverScreen = () => {
        const midPosition = { x: props.width / 2 / config.scale, y: props.height / 2 / config.scale }
        drawText(`Gameover! Your score: ${score}`, midPosition, 1)
        drawText(`Press "s" to start new game`, { ...midPosition, y: midPosition.y + 2 }, 1)
    }

    const getRandomPosition = () => {
        return {
            x: Math.floor(Math.random() * props.width / config.scale),
            y: Math.floor(Math.random() * props.height / config.scale),
        }
    }

    const collapeses = (pos1: Position, pos2: Position) => {
        return pos1.x == pos2.x && pos1.y == pos2.y
    }

    const checkAppleEaten = (snakeHeadPos: Position) => {
        if (collapeses(snakeHeadPos, food)) {
            audioRef.current.eat.play()

            setScore(score + 10)
            createFoodPosition()
            return true
        }

        return false
    }

    const checkSnakeCollision = (snakeHeadPos: Position) => {
        for (const pos of snake) {
            if (collapeses(snakeHeadPos, pos)) {
                return true;
            }
        }

        return false;
    }

    const gameLoop = () => {
        if (gameState == GameState.RUNNING) {
            const snakeCopy: [Position] = JSON.parse(JSON.stringify(snake));
            const snakeHead = snakeCopy[0];
            const newSnakeHeadPosition = { x: snakeHead.x + velocity.x, y: snakeHead.y + velocity.y }
            if (checkSnakeCollision(newSnakeHeadPosition)) end();
            snakeCopy.unshift(newSnakeHeadPosition);
            if (!checkAppleEaten(snakeHead)) snakeCopy.pop();
            setSnake(snakeCopy);
        }
    }

    const started = () => {
        setGameState(GameState.MENU)
    }

    const start = () => {
        setSnake([getRandomPosition()])
        createFoodPosition()
        setVelocity({ x: 1, y: 0 })
        setScore(0)
        setCounter(0)
        setGameState(GameState.RUNNING)
    }

    const resume = () => {
        setGameState(GameState.RUNNING)
    }

    const pause = () => {
        setGameState(GameState.PAUSED)
    }

    const end = () => {
        audioRef.current.gameOver.play()
        setGameState(GameState.GAME_OVER)
    }

    const onKeyUp = (event: any) => {
        switch (gameState) {
            case GameState.MENU:
            case GameState.GAME_OVER:
                switch (event.key) {
                    case '+':
                        if (difficulty <= 1) setDifficulty(difficulty + 1)
                        break
                    case '-':
                        if (difficulty > 0) setDifficulty(difficulty - 1)
                        break;
                }
                break
            case GameState.RUNNING:
                switch (event.key) {
                    case 'ArrowUp':
                        setVelocity({ x: 0, y: -1 })
                        break
                    case 'ArrowDown':
                        setVelocity({ x: 0, y: 1 })
                        break
                    case 'ArrowLeft':
                        setVelocity({ x: -1, y: 0 })
                        break
                    case 'ArrowRight':
                        setVelocity({ x: 1, y: 0 })
                        break
                    case 'p':
                    case 'P':
                        pause()
                        break;
                }
                break;
            case GameState.PAUSED:
                switch (event.key) {
                    case 'p':
                    case 'P':
                        resume()
                        break;
                }
                break
        }

        switch (event.key) {
            case 's':
            case 'S':
                start()
                break;
            case 'q':
                started()
                break;
        }
    }

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            if (ctx) {
                ctx.setTransform(config.scale, 0, 0, config.scale, 0, 0)
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, props.width, props.height)

                hud()
                placeSnake()
                placeFood()

                switch (gameState) {
                    case GameState.MENU:
                        startScreen()
                        break
                    case GameState.PAUSED:
                        pauseScreen()
                        break
                    case GameState.GAME_OVER:
                        gameOverScreen()
                        break
                }

                document.addEventListener('keyup', onKeyUp)

                return () => {
                    document.removeEventListener('keyup', onKeyUp);
                };
            }
        }
    }, [snake, food, gameState, difficulty]);

    return (
        <>
            <canvas
                className="game_board"
                width={props.width}
                height={props.height}
                ref={canvasRef}
            />
        </>
    );
}