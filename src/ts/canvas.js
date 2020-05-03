import { distance, randomIntFromRange } from "./utils.js";
import Person from "./Person.js";
var canvas = document.getElementById('canvas');
var c = canvas.getContext('2d');
canvas.width = 1300;
canvas.height = 800;
var GameState;
(function (GameState) {
    GameState[GameState["START_SCREEN"] = 0] = "START_SCREEN";
    GameState[GameState["IN_GAME"] = 1] = "IN_GAME";
    GameState[GameState["GAME_OVER"] = 2] = "GAME_OVER";
})(GameState || (GameState = {}));
var GC = {
    people: [],
    startTime: new Date,
    endTime: new Date,
    gameState: GameState.START_SCREEN,
    uninfected: 200,
    infected: 300,
    mouse: { x: -200, y: -200 },
    zone: { x: -200, y: -200 }
};
function init() {
    document.getElementById('play').addEventListener('click', function () {
        var initialInfected = parseInt(document.getElementById('infected-count').value);
        var initialUninfected = parseInt(document.getElementById('uninfected-count').value);
        if (initialInfected < 1 || initialInfected > 10 || isNaN(initialInfected)) {
            GC.infected = 1;
        }
        else {
            GC.infected = initialInfected;
        }
        if (initialUninfected < 20 || initialUninfected > 200 || isNaN(initialUninfected)) {
            GC.uninfected = 10;
        }
        else {
            GC.uninfected = initialUninfected;
        }
        initGame();
        GC.gameState = GameState.IN_GAME;
        document.getElementById('menu').style.display = 'none';
        update();
    });
    document.getElementById('re-play').addEventListener('click', function () {
        GC.gameState = GameState.IN_GAME;
        document.getElementById('menu-end').style.display = 'none';
        initGame();
        update();
    });
    document.getElementById('main-menu').addEventListener('click', function () {
        GC.gameState = GameState.START_SCREEN;
        document.getElementById('menu-end').style.display = 'none';
        update();
    });
    canvas.addEventListener('mousemove', function (e) {
        updateMouseCoordinates(e);
    });
}
function initGame() {
    GC.people = [];
    GC.zone.x = -200;
    GC.zone.y = -200;
    generatePeople(GC.uninfected, false);
    generatePeople(GC.infected, true);
    GC.startTime = new Date();
}
function generatePeople(count, isInfected) {
    for (var i = 0; i < count; i++) {
        var radius = 10;
        var x = randomIntFromRange(radius, canvas.width - radius);
        var y = randomIntFromRange(radius, canvas.height - radius);
        if (i !== 0) {
            for (var j = 0; j < GC.people.length; j++) {
                var dist = distance(GC.people[j].x, GC.people[j].y, x, y) - (2 * radius);
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
        GC.people.forEach(function (person) {
            person.update();
        });
        renderZone();
        renderStatus();
    }
    else if (GC.gameState === GameState.GAME_OVER) {
        GC.endTime = new Date();
        var score = calculateScore();
        document.getElementById('score').textContent = score.toString();
        document.getElementById('menu-end').style.display = 'block';
    }
    else {
        document.getElementById('menu').style.display = 'block';
    }
}
function calculateScore() {
    var timeDiff = (GC.endTime - GC.startTime) / 1000;
    var score = (GC.uninfected / GC.infected * 100000) / timeDiff;
    if (score < 0) {
        score = 0;
    }
    return Math.round(score);
}
function clearCanvas() {
    c.clearRect(0, 0, canvas.width, canvas.height);
}
function renderStatus() {
    c.beginPath();
    c.fillStyle = 'rgba(0, 0, 0, .6)';
    c.rect(0, 0, 320, 36);
    c.fill();
    c.font = '14px arial';
    c.fillStyle = 'white';
    var i = 0;
    var ui = 0;
    GC.people.forEach(function (person) {
        person.isInfected ? i++ : ui++;
    });
    c.fillText("Infected: " + i, 100, 23);
    c.fillText("Uninfected: " + ui, 200, 23);
    if (ui === 0) {
        GC.gameState = GameState.GAME_OVER;
    }
}
function renderZone() {
    c.beginPath();
    c.arc(GC.zone.x, GC.zone.y, 40, 0, Math.PI * 2);
    c.fillStyle = 'rgba(31, 89, 24, 0.8)';
    c.fill();
}
canvas.addEventListener('click', function () {
    GC.zone.x = GC.mouse.x;
    GC.zone.y = GC.mouse.y;
});
function updateMouseCoordinates(e) {
    var rect = canvas.getBoundingClientRect();
    GC.mouse.x = e.clientX - rect.left;
    GC.mouse.y = e.clientY - rect.top;
}
init();
update();
export { c, canvas, GC };
