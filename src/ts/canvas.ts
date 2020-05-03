import { distance, randomIntFromRange } from "./utils.js";
import Person from "./Person.js";

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const c = canvas.getContext('2d')!;
canvas.width = 1300;
canvas.height = 800;

enum GameState {
    START_SCREEN,
    IN_GAME,
    GAME_OVER
}

// Game config
let GC: {
    people: Person[],
    startTime: Date | null
    endTime: Date | null,
    gameState: GameState,
    uninfected: number,
    infected: number,
    mouse: {x: number, y: number},
    zone: {x: number, y: number}
} = {
    people: [],
    startTime: new Date,
    endTime: new Date,
    gameState: GameState.START_SCREEN,
    uninfected: 200,
    infected: 300,
    mouse: {x: -200, y: -200},
    zone: {x: -200, y: -200}
}

// Initialize game on click
function init() {
    document.getElementById('play')!.addEventListener('click', () => {

        let initialInfected = parseInt((<HTMLInputElement> document.getElementById('infected-count'))!.value);
        let initialUninfected = parseInt((<HTMLInputElement> document.getElementById('uninfected-count'))!.value);

        if (initialInfected < 1 || initialInfected > 10 || isNaN(initialInfected)) {
            GC.infected = 1;
        } else {
            GC.infected = initialInfected;
        }

        if (initialUninfected < 20 || initialUninfected > 200 || isNaN(initialUninfected)) {
            GC.uninfected = 10;
        } else {
            GC.uninfected = initialUninfected;
        }

        initGame();
        GC.gameState = GameState.IN_GAME;
        document.getElementById('menu')!.style.display = 'none';

        update();
    })
    document.getElementById('re-play')!.addEventListener('click', () => {
        GC.gameState = GameState.IN_GAME;
        document.getElementById('menu-end')!.style.display = 'none';
        initGame();
        update();
    })
    document.getElementById('main-menu')!.addEventListener('click', () => {
        GC.gameState = GameState.START_SCREEN;
        document.getElementById('menu-end')!.style.display = 'none';
        update();
    })
    canvas.addEventListener('mousemove', (e) => {
        updateMouseCoordinates(e);
    })
}

function initGame() {
    // Reset person array and zone
    GC.people = [];
    GC.zone.x =  -200;
    GC.zone.y =  -200;

    // Generate uninfected people
    generatePeople(GC.uninfected, false);

    // Generate infected people
    generatePeople(GC.infected, true);

    // Start the timer
    GC.startTime = new Date();
}

function generatePeople(count: number, isInfected: boolean) {
    for (let i = 0; i < count; i++) {
        const radius = 10;
        let x = randomIntFromRange(radius, canvas.width - radius);
        let y = randomIntFromRange(radius, canvas.height - radius);

        // If this is not the first person generated, prevent this person from being generated on top of another person.
        if (i !== 0) {
            for (let j = 0; j < GC.people.length; j++) {
                const dist = distance(GC.people[j].x, GC.people[j].y, x, y) - (2 * radius);
                if (dist <= 0) {
                    x = randomIntFromRange(radius, canvas.width - radius);
                    y = randomIntFromRange(radius, canvas.height - radius);
                    j = -1;
                }
            }
        }
        GC.people.push(new Person(x, y, radius, isInfected));
    }
}

function update() {
    if (GC.gameState === GameState.IN_GAME) {
    requestAnimationFrame(update);
    clearCanvas();
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.beginPath();
    c.rect(0, 0, canvas.width, canvas.height);
    c.fillStyle = 'rgba(255, 255, 255, 1)';
    c.fill();

    GC.people.forEach((person) => {
        person.update();
    })
    renderZone();
    renderStatus();
    } else if (GC.gameState === GameState.GAME_OVER) {
        // Display end menu
        GC.endTime = new Date();
        let score = calculateScore();
        document.getElementById('score')!.textContent = score.toString();
        document.getElementById('menu-end')!.style.display = 'block';
    } else {
        // Display start menu
        document.getElementById('menu')!.style.display = 'block';
    }
}

function calculateScore() {
    // @ts-ignore
    let timeDiff = (GC.endTime - GC.startTime) / 1000;
    let score = (GC.uninfected / GC.infected * 100000) / timeDiff;
    if (score < 0) {
        score = 0;
    }
    return Math.round(score);
}

function clearCanvas() {
    c.clearRect(0, 0, canvas.width, canvas.height);
}

function renderStatus() {
    c.beginPath()
    c.fillStyle = 'rgba(0, 0, 0, .6)'
    c.rect(0, 0, 320, 36);
    c.fill();

    c.font = '14px arial';
    c.fillStyle = 'white';
    let i = 0;
    let ui = 0;
    GC.people.forEach((person) => {
        person.isInfected ? i++ : ui++;
    })

    c.fillText(`Infected: ${i}`, 100, 23);
    c.fillText(`Uninfected: ${ui}`, 200, 23);

    if (ui === 0) {
        // END THE GAME
        GC.gameState = GameState.GAME_OVER;
    }
}

function renderZone() {
    c.beginPath();
    c.arc(GC.zone.x, GC.zone.y, 40, 0, Math.PI * 2);
    c.fillStyle = 'rgba(31, 89, 24, 0.8)';
    c.fill();
}

canvas.addEventListener('click', () => {
    GC.zone.x = GC.mouse.x;
    GC.zone.y = GC.mouse.y;
})

function updateMouseCoordinates(e: MouseEvent) {
    let rect = canvas.getBoundingClientRect()
    GC.mouse.x = e.clientX - rect.left;
    GC.mouse.y = e.clientY - rect.top;
}

init();
update();

export {
    c,
    canvas,
    GC
}