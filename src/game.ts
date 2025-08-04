import type { Cell, GameState } from './types';

export class Game {
    private board: Cell[][] = [];
    private width: number;
    private height: number;
    private mineCount: number;
    private gameState: GameState = 'playing';
    private firstClick: boolean = true;
    private minesLeft: number;
    private cellsRevealed: number = 0;

    private timer: number = 0;
    private timerInterval: number | undefined;

    // UI Elements
    private boardElement: HTMLElement;
    private minesLeftElement: HTMLElement;
    private timerElement: HTMLElement;

    constructor(width: number, height: number, mineCount: number, boardElement: HTMLElement, minesLeftElement: HTMLElement, timerElement: HTMLElement) {
        this.width = width;
        this.height = height;
        this.mineCount = mineCount;
        this.minesLeft = mineCount;
        this.boardElement = boardElement;
        this.minesLeftElement = minesLeftElement;
        this.timerElement = timerElement;

        this.createBoard();
        this.render();
        this.updateMinesLeftCount();
    }

    private createBoard(): void {
        for (let y = 0; y < this.height; y++) {
            const row: Cell[] = [];
            for (let x = 0; x < this.width; x++) {
                const element = document.createElement('div');
                element.classList.add('cell');
                element.dataset.x = String(x);
                element.dataset.y = String(y);

                row.push({
                    x,
                    y,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    adjacentMines: 0,
                    element,
                });
            }
            this.board.push(row);
        }
    }

    private plantMines(firstClickX: number, firstClickY: number): void {
        let minesToPlant = this.mineCount;
        while (minesToPlant > 0) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);

            // Avoid planting on the first clicked cell and its neighbors
            const isSafeZone = Math.abs(x - firstClickX) <= 1 && Math.abs(y - firstClickY) <= 1;

            if (!this.board[y][x].isMine && !isSafeZone) {
                this.board[y][x].isMine = true;
                minesToPlant--;
            }
        }
    }

    private calculateAllAdjacentMines(): void {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (!this.board[y][x].isMine) {
                    this.board[y][x].adjacentMines = this.countAdjacentMines(x, y);
                }
            }
        }
    }

    private countAdjacentMines(x: number, y: number): number {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const newX = x + dx;
                const newY = y + dy;
                if (this.isValid(newX, newY) && this.board[newY][newX].isMine) {
                    count++;
                }
            }
        }
        return count;
    }

    revealCell(x: number, y: number): void {
        if (this.gameState !== 'playing' || !this.isValid(x, y)) return;

        const cell = this.board[y][x];
        if (cell.isRevealed || cell.isFlagged) return;

        if (this.firstClick) {
            this.plantMines(x,y);
            this.calculateAllAdjacentMines();
            this.startTimer();
            this.firstClick = false;
        }

        cell.isRevealed = true;
        this.cellsRevealed++;

        if (cell.isMine) {
            this.gameOver(false);
            return;
        }

        if (cell.adjacentMines === 0) {
            // Flood fill
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    this.revealCell(x + dx, y + dy);
                }
            }
        }

        this.renderCell(cell);
        this.checkWinCondition();
    }

    toggleFlag(x: number, y: number): void {
        if (this.gameState !== 'playing' || !this.isValid(x, y) || this.firstClick) return;

        const cell = this.board[y][x];
        if (cell.isRevealed) return;

        if (cell.isFlagged) {
            cell.isFlagged = false;
            this.minesLeft++;
        } else {
            cell.isFlagged = true;
            this.minesLeft--;
        }

        this.updateMinesLeftCount();
        this.renderCell(cell);
    }

    private checkWinCondition(): void {
        const nonMineCells = this.width * this.height - this.mineCount;
        if (this.cellsRevealed === nonMineCells) {
            this.gameOver(true);
        }
    }

    private gameOver(isWin: boolean): void {
        this.gameState = isWin ? 'won' : 'lost';
        this.stopTimer();

        // Reveal all mines
        this.board.flat().forEach(cell => {
            if (cell.isMine) {
                cell.isRevealed = true;
            }
            this.renderCell(cell);
        });

        setTimeout(() => {
           alert(isWin ? 'You won!' : 'You lost!');
        }, 100);
    }

    private startTimer(): void {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.timerElement.textContent = `時間: ${this.timer}`;
        }, 1000);
    }

    private stopTimer(): void {
        clearInterval(this.timerInterval);
    }

    private updateMinesLeftCount(): void {
        this.minesLeftElement.textContent = `残り地雷数: ${this.minesLeft}`;
    }

    private isValid(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    private renderCell(cell: Cell): void {
        cell.element.classList.toggle('revealed', cell.isRevealed);
        cell.element.classList.toggle('flagged', cell.isFlagged);
        cell.element.classList.toggle('mine', cell.isMine);

        if (cell.isRevealed && !cell.isMine && cell.adjacentMines > 0) {
            cell.element.textContent = String(cell.adjacentMines);
            cell.element.dataset.count = String(cell.adjacentMines);
        } else {
            cell.element.textContent = '';
        }
    }

    render(): void {
        this.boardElement.innerHTML = '';
        this.boardElement.style.setProperty('--width', String(this.width));
        this.boardElement.style.setProperty('--height', String(this.height));

        this.board.flat().forEach(cell => {
            this.renderCell(cell);
            this.boardElement.appendChild(cell.element);
        });
    }

    // Public method to get game state
    public getGameState(): GameState {
        return this.gameState;
    }
}
