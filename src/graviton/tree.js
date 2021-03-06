/**
 * graviton/tree -- The gravitational body tree structure
 */

const MAX_DEPTH = 1000;

class GtTreeNode {
    constructor(width, height, startX, startY) {
        this.width = width;
        this.height = height;
        this.startX = startX;
        this.startY = startY;

        // Convenience center points.
        this.halfWidth = width / 2;
        this.halfHeight = height / 2;
        this.midX = this.startX + this.halfWidth;
        this.midY = this.startY + this.halfHeight;

        // Matches GtBody's properties.
        this.mass = 0;
        this.x = 0;
        this.y = 0;

        // [NW, NE, SW, SE]
        this.children = new Array(4);
    }

    /** Add a body to the tree, updating mass and centerpoint. */
    addBody(body, depth = 1) {
        if (depth > MAX_DEPTH) {
            // Something's gone wrong.
            return;
        }
        this._updateMass(body);
        const quadrant = this._getQuadrant(body.x, body.y);

        if (this.children[quadrant] instanceof GtTreeNode) {
            this.children[quadrant].addBody(body, depth + 1);
        } else if (!this.children[quadrant]) {
            this.children[quadrant] = body;
        } else {
            const existing = this.children[quadrant];
            const quadX = existing.x > this.midX ? this.midX : this.startX;
            const quadY = existing.y > this.midY ? this.midY : this.startY;
            const node = new GtTreeNode(this.halfWidth, this.halfHeight, quadX, quadY);

            node.addBody(existing, depth + 1);
            node.addBody(body, depth + 1);

            this.children[quadrant] = node;
        }
    }

    /** Update the center of mass based on the addition of a new body. */
    _updateMass(body) {
        const newMass = this.mass + body.mass;
        const newX = (this.x * this.mass + body.x * body.mass) / newMass;
        const newY = (this.y * this.mass + body.y * body.mass) / newMass;
        this.mass = newMass;
        this.x = newX;
        this.y = newY;
    }

    /** Return the quadrant index for a given (x, y) pair. Assumes that it lies within bounds. */
    _getQuadrant(x, y) {
        const xIndex = Number(x > this.midX);
        const yIndex = Number(y > this.midY) * 2;
        return xIndex + yIndex;
    }
}

export default class GtTree {
    constructor(width, height, startX = 0, startY = 0) {
        this.width = width;
        this.height = height;
        this.startX = startX;
        this.startY = startY;
        this.root = undefined;
    }

    addBody(body) {
        if (this.root instanceof GtTreeNode) {
            this.root.addBody(body);
        } else if (!this.root) {
            this.root = body;
        } else {
            const existing = this.root;
            this.root = new GtTreeNode(this.width, this.height, this.startX, this.startY);
            this.root.addBody(existing);
            this.root.addBody(body);
        }
    }

    clear() {
        this.root = undefined;
    }
} // end graviton/tree
