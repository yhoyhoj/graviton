/**
 * graviton/gfx -- The graphics object
 */
export default class GtGfx {
    constructor(args) {
        args = args || {};

        this.grid = typeof args.grid === 'string' ?
            document.getElementById(args.grid) :
            args.grid;

        if (typeof this.grid === 'undefined') {
            throw Error('No usable canvas element was given.');
        }

        this.ctx = this.grid.getContext('2d');
    }

    clear() {
        // Setting the width has the side effect
        // of clearing the canvas
        this.grid.width = this.grid.width;
    }

    drawBodies(bodies, targetBody) {
        for (let body of bodies) {
            this.drawBody(body, /* isTargeted */ body === targetBody);
        }
    }

    drawBody(body, isTargeted) {
        this.ctx.fillStyle = body.color;

        this.ctx.beginPath();
        this.ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2, true);

        this.ctx.fill();
        if (isTargeted) {
            this.ctx.strokeStyle = body.highlight;
            this.ctx.lineWidth = Math.round(body.radius / 8);
            this.ctx.stroke();
        }
    }

    drawReticleLine(from, to) {
        let grad = this.ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        grad.addColorStop(0, 'rgba(31, 75, 130, 1)');
        grad.addColorStop(1, 'rgba(31, 75, 130, 0.1)');
        this.ctx.strokeStyle = grad;
        this.ctx.lineWidth = 6;
        this.ctx.lineCap = 'round';

        // Draw initial background line.
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.stroke();

        // Draw overlay line.
        this.ctx.strokeStyle = '#3477CA';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.stroke();
    }
} // end graviton/gfx
