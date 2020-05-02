import { c, canvas, GC } from "./canvas.js";
import { distance } from "./utils.js";
import { resolveCollision } from './util-elastic-collision.js';
var Person = (function () {
    function Person(_x, _y, radius, isInfected) {
        this._x = _x;
        this._y = _y;
        this.radius = radius;
        this.isInfected = isInfected;
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
        };
        this.mass = 1;
    }
    Object.defineProperty(Person.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (x) {
            this._x = x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Person.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (y) {
            this._y = y;
        },
        enumerable: true,
        configurable: true
    });
    Person.prototype.draw = function () {
        c.beginPath();
        c.arc(this._x, this._y, this.radius, 0, Math.PI * 2);
        if (this.isInfected) {
            c.fillStyle = 'rgba(255, 0, 0, .5)';
        }
        else {
            c.fillStyle = 'rgba(0, 0, 0, .5)';
        }
        c.fill();
    };
    Person.prototype.update = function () {
        this.draw();
        this.keepDistance();
        for (var i = 0; i < GC.people.length; i++) {
            var dist = distance(GC.mouse.x, GC.mouse.y, GC.people[i].x, GC.people[i].y)
                - 8 * this.radius;
            if (dist <= 0) {
                GC.people[i].x += (GC.mouse.x > GC.people[i].x + this.radius) ? -1 : 1;
                GC.people[i].y += (GC.mouse.y > GC.people[i].y + this.radius) ? -1 : 1;
                for (var j = 0; j < GC.people.length; j++) {
                    var dist2 = distance(GC.people[i].x, GC.people[i].y, GC.people[j].x, GC.people[j].y) - 4 * this.radius;
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
        if (this._x - this.radius < 0) {
            this.x = this.radius;
            this.velocity.x *= -1;
        }
        else if (this._x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.velocity.x *= -1;
        }
        if (this._y - this.radius < 0) {
            this.y = this.radius;
            this.velocity.y *= -1;
        }
        else if (this._y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.velocity.y *= -1;
        }
        this._x += this.velocity.x;
        this._y += this.velocity.y;
    };
    Person.prototype.keepDistance = function () {
        for (var i = 0; i < GC.people.length; i++) {
            if (GC.people[i] === this)
                continue;
            var dist = distance(this._x, this._y, GC.people[i].x, GC.people[i].y) - 4 * this.radius;
            if (dist <= 0) {
                resolveCollision(this, GC.people[i]);
            }
        }
    };
    return Person;
}());
export default Person;
