/**
 * graviton/events -- Event queueing and processing
 */
export const KEYCODES = {
    K_LEFT: 37,
    K_UP: 38,
    K_RIGHT: 39,
    K_DOWN: 40,

    K_0: 48,
    K_1: 49,
    K_2: 50,
    K_3: 51,
    K_4: 52,
    K_5: 53,
    K_6: 54,
    K_7: 55,
    K_8: 56,
    K_9: 57,

    K_A: 65,
    K_B: 66,
    K_C: 67,
    K_D: 68,
    K_E: 69,
    K_F: 70,
    K_G: 71,
    K_H: 72,
    K_I: 73,
    K_J: 74,
    K_K: 75,
    K_L: 76,
    K_M: 77,
    K_N: 78,
    K_O: 79,
    K_P: 80,
    K_Q: 81,
    K_R: 82,
    K_S: 83,
    K_T: 84,
    K_U: 85,
    K_V: 86,
    K_W: 87,
    K_X: 88,
    K_Y: 89,
    K_Z: 90,

    K_KP1: 97,
    K_KP2: 98,
    K_KP3: 99,
    K_KP4: 100,
    K_KP5: 101,
    K_KP6: 102,
    K_KP7: 103,
    K_KP8: 104,
    K_KP9: 105,

    K_QUESTIONMARK: 191,

    K_BACKSPACE: 8,
    K_TAB: 9,
    K_ENTER: 13,
    K_SHIFT: 16,
    K_CTRL: 17,
    K_ALT: 18,
    K_ESC: 27,
    K_SPACE: 32
};

export const MOUSECODES = {
    M_LEFT: 0,
    M_MIDDLE: 1,
    M_RIGHT: 2
};

export const EVENTCODES = {
    MOUSEDOWN: 1000,
    MOUSEUP: 1001,
    MOUSEMOVE: 1002,
    MOUSEWHEEL: 1003,
    CLICK: 1004,
    DBLCLICK: 1005,

    KEYDOWN: 1010,
    KEYUP: 1011
};

export const CONTROLCODES = {
    PLAYBTN: 2000,
    PAUSEBTN: 2001,
    TRAILOFFBTN: 2002,
    TRAILONBTN: 2003,
    HELPBTN: 2004,
    QUADTREEOFFBTN: 2005,
    QUADTREEONBTN: 2006,
    BARNESHUTONBTN: 2007,
    BARNESHUTOFFBTN: 2008,
    COLLISIONSOFFBTN: 2009,
    COLLISIONSONBTN: 2010
};


export default class GtEvents {
    constructor(args) {
        args = args || {};

        this.queue = [];

        if (typeof args.grid === 'undefined') {
            throw Error('No usable canvas element was given.');
        }
        this.grid = args.grid;
        this.controls = args.controls;
        this.playBtn = args.playBtn;
        this.pauseBtn = args.pauseBtn;
        this.barnesHutOnBtn = args.barnesHutOnBtn;
        this.barnesHutOffBtn = args.barnesHutOffBtn;
        this.quadTreeOffBtn = args.quadTreeOffBtn;
        this.quadTreeOnBtn = args.quadTreeOnBtn;
        this.collisionsOffBtn = args.collisionsOffBtn;
        this.collisionsOnBtn = args.collisionsOnBtn;
        this.trailOffBtn = args.trailOffBtn;
        this.trailOnBtn = args.trailOnBtn;
        this.helpBtn = args.helpBtn;

        this.wireupEvents();
    }

    qadd(event) {
        this.queue.push(event);
    }

    qpoll() {
        return this.queue.shift();
    }

    qget() {
        // Replacing the reference is faster than `splice()`
        let ref = this.queue;
        this.queue = [];
        return ref;
    }

    qclear() {
        this.queue = [];
    }

    wireupEvents() {
        // Grid mouse events
        this.grid.addEventListener('click', this.handleClick.bind(this));
        this.grid.addEventListener('dblclick', this.handleDblClick.bind(this));

        this.grid.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        this.grid.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.grid.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.grid.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.grid.addEventListener('wheel', this.handleMouseWheel.bind(this));

        // Grid key events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));

        // Control events
        this.playBtn.addEventListener('click', this.handleControlClick.bind(this,
                    CONTROLCODES.PLAYBTN));
        this.pauseBtn.addEventListener('click', this.handleControlClick.bind(this,
                    CONTROLCODES.PAUSEBTN));
        this.barnesHutOnBtn.addEventListener('click', this.handleControlClick.bind(this,
                    CONTROLCODES.BARNESHUTONBTN));
        this.barnesHutOffBtn.addEventListener('click', this.handleControlClick.bind(this,
                    CONTROLCODES.BARNESHUTOFFBTN));
        this.quadTreeOffBtn.addEventListener('click', this.handleControlClick.bind(this,
                    CONTROLCODES.QUADTREEOFFBTN));
        this.quadTreeOnBtn.addEventListener('click', this.handleControlClick.bind(this,
                    CONTROLCODES.QUADTREEONBTN));
        this.collisionsOnBtn.addEventListener('click', this.handleControlClick.bind(this,
                    CONTROLCODES.COLLISIONSONBTN));
        this.collisionsOffBtn.addEventListener('click', this.handleControlClick.bind(this,
                    CONTROLCODES.COLLISIONSOFFBTN));
        this.trailOffBtn.addEventListener('click', this.handleControlClick.bind(this,
                    CONTROLCODES.TRAILOFFBTN));
        this.trailOnBtn.addEventListener('click', this.handleControlClick.bind(this,
                    CONTROLCODES.TRAILONBTN));
        this.helpBtn.addEventListener('click', this.handleControlClick.bind(this,
                    CONTROLCODES.HELPBTN));
    }

    handleClick(event) {
        this.qadd({
            type: EVENTCODES.CLICK,
            position: this.getPosition(event),
            button: event.button,
            shift: event.shiftKey,
            ctrl: event.ctrlKey,
            timestamp: event.timeStamp
        });
    }

    handleDblClick(event) {
        this.qadd({
            type: EVENTCODES.DBLCLICK,
            position: this.getPosition(event),
            button: event.button,
            shift: event.shiftKey,
            ctrl: event.ctrlKey,
            timestamp: event.timeStamp
        });
    }

    handleContextMenu(event) {
        // Prevent right-click menu
        event.preventDefault();
    }

    handleMouseDown(event) {
        this.qadd({
            type: EVENTCODES.MOUSEDOWN,
            position: this.getPosition(event),
            button: event.button,
            shift: event.shiftKey,
            ctrl: event.ctrlKey,
            timestamp: event.timeStamp
        });
    }

    handleMouseUp(event) {
        this.qadd({
            type: EVENTCODES.MOUSEUP,
            position: this.getPosition(event),
            button: event.button,
            shift: event.shiftKey,
            ctrl: event.ctrlKey,
            timestamp: event.timeStamp
        });
    }

    handleMouseMove(event) {
        this.qadd({
            type: EVENTCODES.MOUSEMOVE,
            position: this.getPosition(event),
            timestamp: event.timeStamp
        });
    }

    handleMouseWheel(event) {
        // Reverse the up/down.
        let delta = -event.deltaY / 50;

        this.qadd({
            type: EVENTCODES.MOUSEWHEEL,
            position: this.getPosition(event),
            delta: delta,
            shift: event.shiftKey,
            ctrl: event.ctrlKey,
            timestamp: event.timeStamp
        });

        // Prevent the window from scrolling
        event.preventDefault();
    }

    handleKeyDown(event) {
        // Account for browser discrepancies
        let key = event.keyCode || event.which;

        this.qadd({
            type: EVENTCODES.KEYDOWN,
            keycode: key,
            shift: event.shiftKey,
            ctrl: event.ctrlKey,
            timestamp: event.timeStamp
        });
    }

    handleKeyUp(event) {
        // Account for browser discrepancies
        let key = event.keyCode || event.which;

        this.qadd({
            type: EVENTCODES.KEYUP,
            keycode: key,
            shift: event.shiftKey,
            ctrl: event.ctrlKey,
            timestamp: event.timeStamp
        });
    }

    handleControlClick(type, event) {
        this.qadd({
            type: type,
            timestamp: event.timeStamp
        });
    }

    getPosition(event) {
        // Calculate offset on the grid from clientX/Y, because
        // some browsers don't have event.offsetX/Y
        return {
            x: event.clientX - this.grid.offsetLeft,
            y: event.clientY - this.grid.offsetTop
        };
    }
} // end graviton/events
