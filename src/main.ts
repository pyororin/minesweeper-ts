import './style.css';
import { Game } from './game';

document.addEventListener('DOMContentLoaded', () => {
    const widthInput = document.getElementById('width') as HTMLInputElement;
    const heightInput = document.getElementById('height') as HTMLInputElement;
    const minesInput = document.getElementById('mines') as HTMLInputElement;
    const newGameBtn = document.getElementById('new-game-btn') as HTMLButtonElement;
    const boardElement = document.getElementById('game-board') as HTMLDivElement;
    const minesLeftElement = document.getElementById('mines-left') as HTMLSpanElement;
    const timerElement = document.getElementById('timer') as HTMLSpanElement;

    let game: Game;

    function newGame() {
        const width = parseInt(widthInput.value, 10);
        const height = parseInt(heightInput.value, 10);
        let mines = parseInt(minesInput.value, 10);

        // Validate inputs
        if (width <= 0 || height <= 0 || mines <= 0) {
            alert('幅、高さ、地雷の数は1以上である必要があります。');
            return;
        }
        if (mines >= width * height) {
            alert('地雷の数はマスの総数より少なくしてください。');
            return;
        }
        if (width > 50 || height > 50) {
            alert('幅と高さは50以下にしてください。');
            return;
        }

        game = new Game(width, height, mines, boardElement, minesLeftElement, timerElement);
    }

    newGameBtn.addEventListener('click', newGame);

    boardElement.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('cell') && game.getGameState() === 'playing') {
            const x = parseInt(target.dataset.x!, 10);
            const y = parseInt(target.dataset.y!, 10);
            game.revealCell(x, y);
        }
    });

    boardElement.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        const target = event.target as HTMLElement;
        if (target.classList.contains('cell') && game.getGameState() === 'playing') {
            const x = parseInt(target.dataset.x!, 10);
            const y = parseInt(target.dataset.y!, 10);
            game.toggleFlag(x, y);
        }
    });

    // Start the first game
    newGame();
});
