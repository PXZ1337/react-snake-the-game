export interface GameBoardProps {
    width: number
    height: number
}

export interface Position {
    x: number,
    y: number
}

export interface GameAudio {
    gameOver: HTMLAudioElement
    eat: HTMLAudioElement
}

export enum GameState {
    MENU, RUNNING, PAUSED, GAME_OVER
}

interface GameConfig {
    scale: number,
    baseSpeed: number,
}

export const config: GameConfig = {
    scale: 20,
    baseSpeed: 100
}