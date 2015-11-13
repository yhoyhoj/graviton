/**
 * graviton/sim -- The gravitational simulator
 */
define(['util/lambda', 'util/log', 'graviton/body'], function(L, log, gtBody) {
    'use strict';

    return function(args) {
        var self = {
            // Attributes
            //-----------------

            options: {},
            bodies: [],
            time: 0,

            // Functions
            //-----------------

            step: function() {
                L.foreach(this.bodies, function(body, i) {
                    if (this.options.collisions === true) {
                        this.detectCollision(this.bodies[i], i);
                    }

                    this.calculateNewPosition(body, i, this.options.deltaT);

                    this.removeScattered(body, i);
                }, this);

                this.time += this.options.deltaT; // Increment runtime
            },

            calculateNewPosition: function(body, index, deltaT) {
                var netFx = 0;
                var netFy = 0;

                // Iterate through all bodies and sum the forces exerted
                L.foreach(this.bodies, function(attractor, i) {
                    if (i !== index) {
                        // Get the distance and position deltas
                        var D = this.calculateDistance(body, attractor);

                        // Calculate force using Newtonian gravity, separate out into x and y components
                        var F = (this.options.G * body.mass * attractor.mass) / Math.pow(D.r, 2);
                        var Fx = F * (D.dx / D.r);
                        var Fy = F * (D.dy / D.r);

                        netFx += Fx;
                        netFy += Fy;
                    }
                }, this);

                // Calculate accelerations
                var ax = netFx / body.mass;
                var ay = netFy / body.mass;

                // Calculate new velocities, normalized by the 'time' interval
                body.velX += deltaT * ax;
                body.velY += deltaT * ay;

                // Calculate new positions after timestep deltaT
                body.x += deltaT * body.velX;
                body.y += deltaT * body.velY;
            },

            calculateDistance: function(body, other) {
                var D = {};

                // Calculate the change in position along the two dimensions
                D.dx = other.x - body.x;
                D.dy = other.y - body.y;

                // Obtain the distance between the objects (hypotenuse)
                D.r = Math.sqrt(Math.pow(D.dx, 2) + Math.pow(D.dy, 2));

                return D;
            },

            detectCollision: function(body, index) {
                L.foreach(this.bodies, function(collider, i) {
                    if (i !== index) {
                        var r = this.calculateDistance(body, collider).r;
                        var clearance = body.radius + collider.radius;

                        if (r <= clearance) {
                            // Collision detected
                            log.write('Collision detected!!', 'debug');
                        }
                    }
                }, this);
            },

            removeScattered: function(body, index) {
                if (body.x > this.options.scatterLimit ||
                    body.x < -this.options.scatterLimit ||
                    body.y > this.options.scatterLimit ||
                    body.y < -this.options.scatterLimit) {
                    // Remove from body collection
                    return L.remove(this.bodies, index);
                }
            },

            addNewBody: function(args) {
                var body = gtBody(args);
                this.bodies.push(body);

                return body;
            },

            removeBody: function(index) {
                L.remove(this.bodies, index);
            },

            clear: function() {
                this.bodies.length = 0; // Remove all bodies from collection
            }
        };

        args = args || {};

        // Process arguments
        //------------------
        self.options.G = args.G || 6.67384 * Math.pow(10, -11); // Gravitational constant
        self.options.deltaT = args.deltaT || 25000; // Timestep
        self.options.collisions = args.collision || true;
        self.options.scatterLimit = args.scatterLimit || 10000;

        return self;
    }; // end graviton/sim
});