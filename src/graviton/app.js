/**
 * graviton/app -- The interactive graviton application
 */
import random from '../util/random';
import gtSim from './sim';
import gtGfx from './gfx';
import gtEvents, { KEYCODES, EVENTCODES, CONTROLCODES } from './events';
import gtTimer from './timer';

export default class {
    constructor(args = {}) {
        this.args = args;

        this.options = {};
        this.grid = null;

        this.animTimer = null;
        this.simTimer = null;

        this.events = null;
        this.sim = null;
        this.gfx = null;

        this.noclear = false;
        this.interaction = {};

        this.options.width = args.width || window.innerWidth;
        this.options.height = args.height || window.innerHeight;
        this.options.backgroundColor = args.backgroundColor || '#1F263B';

        // Retrieve canvas, or build one with arguments
        this.grid = typeof args.grid === 'string' ?
            document.getElementById(args.grid) :
            args.grid;

        if (typeof this.grid === 'undefined') {
            this.generateGrid(this.options.width, this.options.height,
                    {backgroundColor: this.options.backgroundColor});
            args.grid = this.grid;
        }

        this.controls = typeof args.controls === 'string' ?
            document.getElementById(args.controls) :
            args.controls;

        if (typeof this.controls === 'undefined') {
            this.generateControls();
            args.controls = this.controls;
        }

        this.playBtn = args.playBtn = this.controls.querySelector('#playbtn');
        this.pauseBtn = args.pauseBtn = this.controls.querySelector('#pausebtn');

        // Initialize
        this.initComponents();
        this.initTimers();
    }

    /**
     * main -- Main 'game' loop
     */
    main() {
        // Event processing
        //--------------------
        this.events.qget().forEach(function(event) {
            let retval;

            switch (event.type) {
                case EVENTCODES.MOUSEDOWN:
                    // Add flag to signal other events
                    this.interaction.started = true;

                    this.interaction.body = this.sim.addNewBody({
                        x: event.position.x,
                        y: event.position.y
                    });

                    this.interaction.previous = {
                        x: event.position.x,
                        y: event.position.y
                    };
                    break; // end MOUSEDOWN

                case EVENTCODES.MOUSEUP:
                    if (this.interaction.started) {
                        this.interaction.started = false;

                        let body = this.interaction.body;

                        body.velX = (event.position.x - body.x) * 0.0000001;
                        body.velY = (event.position.y - body.y) * 0.0000001;
                    }
                    break;

                case EVENTCODES.MOUSEMOVE:
                    if (this.interaction.started) {
                        this.interaction.previous = {
                            x: event.position.x,
                            y: event.position.y
                        };
                    }
                    break; // end MOUSEMOVE

                case EVENTCODES.MOUSEWHEEL:
                    break; // end MOUSEWHEEL

                case EVENTCODES.KEYDOWN:
                    switch (event.keycode) {
                        case KEYCODES.K_ENTER:
                            // Start or stop simulation
                            this.toggle();
                            break;

                        case KEYCODES.K_C:
                            // Clear simulation
                            this.sim.clear();
                            this.gfx.clear();
                            this.simTimer.stop();
                            retval = false;
                            break;

                        case KEYCODES.K_P:
                            // Toggle trails
                            this.noclear = !this.noclear;
                            break;

                        case KEYCODES.K_R:
                            // Generate random objects
                            this.generateBodies(10, {randomColors: true});
                            break;

                        case KEYCODES.K_T:
                            this.sim.addNewBody({
                                x: this.options.width / 2, y: this.options.height / 2,
                                velX: 0, velY: 0,
                                mass: 2000, radius: 50, color: '#5A5A5A'
                            });
                            this.sim.addNewBody({
                                x: this.options.width - 400, y: this.options.height / 2,
                                velX: 0, velY: 0.000025,
                                mass: 1, radius: 5, color: '#787878'
                            });
                            break;
                    }
                    break; // end KEYDOWN
                case CONTROLCODES.PLAYBTN:
                    this.playBtn.style.display = 'none';
                    this.pauseBtn.style.display = '';
                    this.toggle();
                    break;
                case CONTROLCODES.PAUSEBTN:
                    this.playBtn.style.display = '';
                    this.pauseBtn.style.display = 'none';
                    this.toggle();
                    break;
            }

            return retval;
        }, this);

        // Redraw screen
        this.redraw();
    }

    initComponents() {
        // Create components -- order is important
        this.events = this.args.events = new gtEvents(this.args);
        this.sim = new gtSim(this.args);
        this.gfx = new gtGfx(this.args);
    }

    initTimers() {
        // Add `main` loop, and start immediately
        this.animTimer = new gtTimer(this.main.bind(this));
        this.animTimer.start();
        this.simTimer = new gtTimer(this.sim.step.bind(this.sim), 60);
    }

    toggle() {
        this.simTimer.toggle();
    }

    redraw() {
        if (!this.noclear) {
            this.gfx.clear();
        }
        this.drawInteraction();
        this.gfx.drawBodies(this.sim.bodies);
    }

    generateGrid(width, height, style) {
        // Attach a canvas to the page, to house the simulations
        if (!style) {
            style = {};
        }

        this.grid = document.createElement('canvas');

        this.grid.width = width;
        this.grid.height = height;
        this.grid.style.display = 'block';
        this.grid.style.marginLeft = style.marginLeft || 'auto';
        this.grid.style.marginRight = style.marginRight || 'auto';
        this.grid.style.backgroundColor = style.backgroundColor || '#000000';

        document.body.appendChild(this.grid);
    }

    generateControls() {
        this.controls = document.createElement('menu');
        this.controls.type = 'toolbar';
        this.controls.id = 'controls';
        this.controls.innerHTML = `
            <menuitem id="playbtn">
                <img src="assets/play.svg">
            </menuitem>
            <menuitem id="pausebtn" style="display: none;">
                <img src="assets/pause.svg">
            </menuitem>
            `;

        document.body.appendChild(this.controls);
    }

    generateBodies(num, args) {
        args = args || {};

        let minX = args.minX || 0;
        let maxX = args.maxX || this.options.width;
        let minY = args.minY || 0;
        let maxY = args.maxY || this.options.height;

        let minVelX = args.minVelX || 0;
        let maxVelX = args.maxVelX || 0.00001;
        let minVelY = args.minVelY || 0;
        let maxVelY = args.maxVelY || 0.00001;

        let minMass = args.minMass || 1;
        let maxMass = args.maxMass || 150;

        let minRadius = args.minRadius || 1;
        let maxRadius = args.maxRadius || 15;

        let color = args.color;

        for (let i = 0; i < num; i++) {
            if (args.randomColors === true) {
                color = random.color();
            }

            this.sim.addNewBody({
                x: random.number(minX, maxX),
                y: random.number(minY, maxY),
                velX: random.directional(minVelX, maxVelX),
                velY: random.directional(minVelY, maxVelY),
                mass: random.number(minMass, maxMass),
                radius: random.number(minRadius, maxRadius),
                color: color
            });
        }
    }

    drawInteraction() {
        if (this.interaction.started) {
            this.gfx.drawReticleLine({
                from: {
                    x: this.interaction.body.x,
                    y: this.interaction.body.y
                },
                to: this.interaction.previous
            });
        }
    }
} // end graviton/app
