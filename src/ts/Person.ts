import { c, canvas, GC } from "./canvas.js";
import { distance } from "./utils.js";

// @ts-ignore
import { resolveCollision } from './util-elastic-collision.js';

export default class Person {
    private velocity: { x: number, y: number };
    private mass: number;
    constructor(
        private _x: number,
        private _y: number,
        private radius: number,
        public isInfected: boolean
    ) {
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
        }
        this.mass = 1;
    }

    get x() {
        return this._x;
    }

    set x(x: number) {
        this._x = x;
    }

    get y() {
        return this._y;
    }

    set y(y: number) {
        this._y = y;
    }

    draw() {
        c.beginPath();
        c.arc(this._x, this._y, this.radius, 0, Math.PI * 2);
        if (this.isInfected) {
            c.fillStyle = 'rgba(255, 0, 0, .5)';
        } else {
            c.fillStyle = 'rgba(0, 0, 0, .5)';
        }

        c.fill();
    }

    update() {
        this.draw();
        this.keepDistance();

        // Bounce off the mouse
        for (let i = 0; i < GC.people.length; i++) {
            let dist = distance(GC.mouse.x, GC.mouse.y, GC.people[i].x, GC.people[i].y)
                - 8 * this.radius;
            if (dist <= 0) {
                GC.people[i].x += (GC.mouse.x > GC.people[i].x + this.radius) ? -1 : 1;
                GC.people[i].y += (GC.mouse.y > GC.people[i].y + this.radius) ? -1 : 1;

                for (let j = 0; j < GC.people.length; j++) {
                    let dist2 = distance(GC.people[i].x, GC.people[i].y, GC.people[j].x,
                        GC.people[j].y) - 4 * this.radius;
                    if (dist2 <= 0) {
                        if (GC.people[i].isInfected && !GC.people[j].isInfected) {
                            GC.people[j].isInfected = true;
                        }

                        if (!GC.people[i].isInfected && GC.people[j].isInfected) {
                            GC.people[i].isInfected = false;
                        }
                    }
                }
            }
        }

        if (distance(this.x, this.y, GC.zone.x, GC.zone.y) < 50) {
            this.isInfected = true;
        }

        // Bounce off the walls
        if (this._x - this.radius < 0) {
            this.x = this.radius;
            this.velocity.x *= -1;
        } else if (this._x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.velocity.x *= -1;
        }

        if (this._y - this.radius < 0) {
            this.y = this.radius;
            this.velocity.y *= -1;
        } else if (this._y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.velocity.y *= -1;
        }

        this._x += this.velocity.x;
        this._y += this.velocity.y;
    }

    keepDistance() {
        // Bounce off other people
        for (let i = 0; i < GC.people.length; i++) {
            if (GC.people[i] === this) continue;
            let dist = distance(this._x, this._y, GC.people[i].x, GC.people[i].y) - 4 * this.radius;
            if (dist <= 0) {
                resolveCollision(this, GC.people[i]);
            }
        }
    }
}