/*!
 *
 * Matt's Zombie Game, version 0.1
 *
 * February 2013 Matt Stevens, http://dirtymonkey.co.uk
 *
 */
(function(window, undefined) {

    // application object
    var Game = {};

    // settings
    Game.screen_dimensions = {width: 650, height: 400};
    Game.canvas_container = "screen";
    Game.number_of_zombies = 5;

    // game entities and utilities
    Game.characters = [];
    Game.zombies = [];
    Game.player = {};
    Game.pressed_keys = [];
    Game.key_map = {
        up:    38,
        down:  40,
        left:  37,
        right: 39
    };

    // subscriptions
    Game.subscriptions = {};

    // Credit:
    // Peter Higgens – https://github.com/phiggins42/bloody-jquery-plugins/blob/master/pubsub.js
    Game.publish = function(topic, args) {
        Game.subscriptions[topic] && $.each(Game.subscriptions[topic], function() {
            this.apply(Game, args || []);
        });
    };

    Game.subscribe = function(topic, callback) {
        if (!Game.subscriptions[topic]) {
            Game.subscriptions[topic] = [];
        }
        Game.subscriptions[topic].push(callback);
        return [topic, callback];
    };

    Game.unsubscribe = function(handle) {
        var t = handle[0];
        Game.subscriptions[t] && $.each(Game.subscriptions[topic], function(idx) {
            if (this == handle[1]) {
                Game.subscriptions[topic].splice(idx, 1);
            }
        });
    };

  /*************************************************************************/
  /* Main Functions
  /*************************************************************************/
    Game.createCanvas = function() {
        Game.canvas = document.createElement("canvas");
        Game.canvas.width = Game.screen_dimensions.width;
        Game.canvas.height = Game.screen_dimensions.height;
        Game.canvas.ctx = Game.canvas.getContext("2d");
        document.getElementById(Game.canvas_container).appendChild(Game.canvas);
    };

    Game.initiate_keys = function() {
        for (var keyCode in Game.key_map) {
            if (Game.key_map.hasOwnProperty(keyCode)) {
                Game.pressed_keys[Game.key_map[keyCode]] = {
                    isDown: false,
                    wasDown: false
                };
            }
        }
    };

    Game.createZombies = function() {
        for (var i = 0; i <= Game.number_of_zombies; i++)
            Game.zombies[i] = Game.Zombie.create();
        Game.zombies[1].willCollide();
    };

    Game.createBuildings = function() {
        // stub…
    };

    Game.input = function() {
        if (Game.pressed_keys[Game.key_map.up].isDown)
            Game.player.moveUp();

        if (Game.pressed_keys[Game.key_map.down].isDown)
            Game.player.moveDown();

        if (Game.pressed_keys[Game.key_map.left].isDown)
            Game.player.moveLeft();

        if (Game.pressed_keys[Game.key_map.right].isDown)
            Game.player.moveRight();

        // update the previous status of keys
        for (var keyCode in Game.key_map) {
            if (Game.key_map.hasOwnProperty(keyCode)) {
                var key = Game.pressed_keys[Game.key_map[keyCode]];
                key.wasDown = key.isDown;
            }
        }
    };

    Game.update = function() {
        // update zombie positions
        for (var i = 0; i <= Game.number_of_zombies; i++)
            Game.zombies[i].moveTowards(Game.player);
    };

    Game.render = function() {
        // clear the canvas, ready for a new frame
        Game.canvas.ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height);

        // render all of the zombies
        for (var i = 0; i <= Game.number_of_zombies; i++)
            Game.zombies[i].render();

        // render the player
        Game.player.render();
    };

    Game.startGame = function() {
        Game.player = Game.Player.create();
        Game.createZombies();
        Game.gameLoop();
    };

    Game.gameLoop = function() {
        requestAnimationFrame(Game.gameLoop);

        // where it all happens
        Game.input();
        Game.update();
        Game.render();
    };

  /*************************************************************************/
  /* Game objects
  /*************************************************************************/
    Game.Character = Object.extend({
        radius: 10,
        border_width: 2,

        initialize: function() {
            this.getBoundaries();
            this.randomPosition();
            Game.characters.push(this);
        },

        randomPosition: function() {
            this.x = Math.floor(Math.random() * (this.max_x - this.min_x + 1)) + this.min_x;
            this.y = Math.floor(Math.random() * (this.max_y - this.min_y + 1)) + this.min_y;
        },

        getBoundaries: function() {
            this.max_x = Game.screen_dimensions.width - (this.radius + this.border_width);
            this.max_y = Game.screen_dimensions.height - (this.radius + this.border_width);
            this.min_x = (this.radius + this.border_width);
            this.min_y = (this.radius + this.border_width);
        },

        render: function() {
            Game.canvas.ctx.beginPath();
            Game.canvas.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
            Game.canvas.ctx.fillStyle = this.colour;
            Game.canvas.ctx.fill();
            Game.canvas.ctx.lineWidth = this.border_width;
            Game.canvas.ctx.strokeStyle = this.border_colour;
            Game.canvas.ctx.stroke();
        },

        willCollide: function(x, y) {
            for (var i = 0; i < Game.characters.length; i++) {
                var character = Game.characters[i];

                // skip testing myself
                if (character === this)
                    continue;

                var distance_x = x - character.x,
                    distance_y = y - character.y,
                    distance = ((distance_x * distance_x) + (distance_y * distance_y)),
                    minimum_hit = (this.radius * 2) * (this.radius * 2);

                if  (minimum_hit > distance_x * distance_x + distance_y * distance_y)
                    return true;
            }
        },
    });

    Game.Zombie = Object.extend(Game.Character, {
        max_speed: 3.0,
        min_speed: 0.2,
        colour: "#962E27", // D83228
        border_colour: "#601d19", // 9f241d

        initialize: function(parent) {
            parent.initialize.call(this);
            this.randomSpeed();
        },

        randomSpeed: function() {
            this.speed = Math.random() * (this.max_speed - this.min_speed) + this.min_speed;
        },

        moveTowards: function(player) {
            var distance_x = player.x - this.x,
                distance_y = player.y - this.y,
                distance = Math.sqrt((distance_x * distance_x) + (distance_y * distance_y)),
                x = distance_x / distance,
                y = distance_y / distance;

            this.move(x, y);
        },

        move: function(x, y) {
            var next_x = this.x + (this.speed * x),
                next_y = this.y + (this.speed * y);

            // don't move if the next position already contains something
            if (this.willCollide(next_x, next_y))
                return;

            this.x = next_x;
            this.y = next_y;
        },
    });

    Game.Player = Object.extend(Game.Character, {
        speed: 4,
        speed_modifier: 0,
        colour: "#94A16D",
        border_colour: "#707b4f",

        initialize: function(parent) {
            parent.initialize.call(this);
        },

        moveUp: function() {
            if (this.y >= this.min_y) {
                next_y = this.y - this.speed + this.speed_modifier;
                if (!this.willCollide(this.x, next_y)) this.y = next_y;
            }
        },

        moveDown: function() {
            if (this.y <= this.max_y) {
                next_y = this.y + this.speed + this.speed_modifier;
                if (!this.willCollide(this.x, next_y)) this.y = next_y;
            }
        },

        moveLeft: function() {
            if (this.x >= this.min_x) {
                next_x = this.x - this.speed + this.speed_modifier;
                if (!this.willCollide(next_x, this.y)) this.x = next_x;
            }
        },

        moveRight: function() {
            if (this.x <= this.max_x) {
                next_x = this.x + this.speed + this.speed_modifier;
                if (!this.willCollide(next_x, this.y)) this.x = next_x;
            }
        },
    });

  /*************************************************************************/
  /* Subscriptions
  /*************************************************************************/
    Game.subscribe("init", function() {
        Game.initiate_keys();
        Game.createCanvas();
        Game.startGame();
    });

  /*************************************************************************/
  /* Events
  /*************************************************************************/
    // DOM Ready
    $(function() {
        Game.publish("init");
        $("#screen").focus();
    });

    $(document).keydown(function(e) {
        Game.pressed_keys[e.which].isDown = true;
    });

    $(document).keyup(function(e) {
        Game.pressed_keys[e.which].isDown = false;
    });
})(window);
