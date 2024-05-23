window.addEventListener('load', (e)=>{
  const canvas = document.getElementById("canvas1");
  const cxt = canvas.getContext("2d");

  const CANVAS_WIDTH = (canvas.width = 800);
  const CANVAS_HEIGHT = (canvas.height = 600);

  const spriteImage = new Image();
  spriteImage.src = "assets/images/unicorn.png";
  const demonImage = new Image();
  demonImage.src = "assets/images/unicorn_demon.png"
  const playerImage = new Image();
  playerImage.src = "assets/images/ninja.png";
  const projectileImage = new Image();
  projectileImage.src = "assets/images/laser.png";
  const fireball = new Image();
  projectileImage.src = "assets/images/fireball.png";

  //////////keyboard input
  class InputHandler {
    constructor() {
      this.keys = [];
      window.addEventListener("keydown", (e) => {
        if (
          (e.key === "ArrowDown" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowUp" ||
            e.key === "ArrowRight" ||
            e.code === "Space") &&
          this.keys.indexOf(e.key) === -1
        ) {
          this.keys.push(e.key);
        }
      });
      window.addEventListener("keyup", (e) => {
        if (
          e.key === "ArrowDown" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowRight" ||
          e.code === "Space"
        ) {
          this.keys.splice(this.keys.indexOf(e.key), 1);
        }
      });
      window.addEventListener("click", (e) => {
        if (gameOverLose || gameOverWin) restartGame();
      });
    }
  }
  ////////////////
  class Projectile {
    constructor(x, y, direction) {
      this.x = x;
      this.y = y;
      this.w = 16;
      this.h = 16;
      this.spriteW = 16;
      this.spriteH = 16;
      this.frameX = 0;
      this.frameY = 0;
      this.speed = 8;
      this.vx = 0;
      this.vy = 0;
      this.direction = direction;
      this.moving = false;
      this.markedForDeletion = false;
      this.rotation = 0;
    }
    update() {
      if (this.direction === "LEFT") {
        this.vx = -this.speed;
        this.rotation = Math.PI;
      }
      if (this.direction === "RIGHT") {
        this.vx = this.speed;
        this.rotation = 0;
      }
      if (this.direction === "UP") {
        this.vy = -this.speed;
        this.rotation = Math.PI * 1.5;
      }
      if (this.direction === "DOWN") {
        this.vy = this.speed;
        this.rotation = Math.PI * 0.5;
      }

      this.x += this.vx;
      this.y += this.vy;

      if (
        this.x < 0 - this.w ||
        this.x > CANVAS_WIDTH ||
        this.y < 0 - this.h ||
        this.y > CANVAS_HEIGHT
      ) {
        this.moving = false;
        this.readyToRemove();
      }
    }
    display() {
      cxt.fillStyle = "red";
      cxt.fillRect(this.x, this.y, this.w, this.h);
      cxt.save();
      cxt.translate(this.x + this.w / 2, this.y+this.h/2);
      cxt.rotate(this.rotation);
      cxt.drawImage(
        projectileImage,
        this.frameX * this.spriteW,
        this.frameY * this.spriteH,
        this.spriteW,
        this.spriteH,
        -this.w/2,
        -this.h/2,
        this.w,
        this.h
      );
      cxt.restore();
    }
    readyToRemove() {
      this.markedForDeletion = true;
    }
  }
  ////////////////
  class Player {
    constructor() {
      this.spriteW = 48;
      this.spriteH = 54;
      this.w = this.spriteW;
      this.h = this.spriteH;
      this.x = Math.random() * (CANVAS_WIDTH - this.w);
      this.y = Math.random() * (CANVAS_HEIGHT - this.h);
      this.vx = 0; //Math.random() * 10
      this.vy = 0; //Math.random() * 10

      this.frameX = 0;
      this.frameY = 2;
      this.maxFrames = 3; //3 for chars, 4 for unicorn
      this.sound = new Audio();
      this.sound.src = "assets/sounds/laserShoot.wav";

      //animation timing
      this.fps = 8;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;

      //new vars
      this.speed = 5;
      this.direction = "DOWN";
      this.firingFps = 10;
      this.firingTimer = 0;
      this.firingInterval = 1000 / this.firingFps;
      this.readyToFire = true;
    }

    update(deltaTime) {
      this.animationLogic(deltaTime);
      this.movementLogic();
      this.firingLogic(deltaTime);
    }

    display() {
      // cxt.fillStyle = this.color;
      // cxt.strokeRect(this.x, this.y, this.w, this.h);
      cxt.drawImage(
        playerImage,
        this.frameX * this.spriteW,
        this.frameY * this.spriteH,
        this.spriteW,
        this.spriteH,
        this.x,
        this.y,
        this.w,
        this.h
      );
    } //end display

    animationLogic(deltaTime) {
      ////animation
      if (this.frameTimer > this.frameInterval) {
        this.frameTimer = 0;
        this.frameX = (this.frameX + 1) % this.maxFrames;
      } else {
        this.frameTimer += deltaTime;
      }
    } //end animation

    movementLogic() {
      ////movement
      if (input.keys.indexOf("ArrowRight") != -1) {
        this.vx = this.speed;
        this.frameY = 1;
        this.direction = "RIGHT";
      } else if (input.keys.indexOf("ArrowLeft") != -1) {
        this.vx = -this.speed;
        this.frameY = 3;
        this.direction = "LEFT";
      } else if (input.keys.indexOf("ArrowUp") != -1) {
        this.vy = -this.speed;
        this.frameY = 0;
        this.direction = "UP";
      } else if (input.keys.indexOf("ArrowDown") != -1) {
        this.vy = this.speed;
        this.frameY = 2;
        this.direction = "DOWN";
      } else {
        this.vx = 0;
        this.vy = 0;
      }

      this.x += this.vx;
      this.y += this.vy;
      ////wrap movement
      if (this.x > CANVAS_WIDTH) this.x = 0 - this.w;
      if (this.x < 0 - this.w) this.x = CANVAS_WIDTH;
      if (this.y > CANVAS_HEIGHT) this.y = 0 - this.h;
      if (this.y < 0 - this.h) this.y = CANVAS_HEIGHT;

      //   if x is bigger than cw then make vx reverse
      // if (this.x + this.w > CANVAS_WIDTH || this.x < 0) {
      //   this.vx = this.vx * -1
      //   // this.sound.play();
      // }
      // if (this.y + this.h > CANVAS_HEIGHT || this.y < 0) {
      //   this.vy = this.vy * -1
      //   // this.sound.play();
      // }
    } //end movement

    firingLogic(deltaTime) {
      ////firing
      if (this.firingTimer > this.firingInterval) {
        this.firingTimer = 0;
        this.readyToFire = true;
      } else {
        this.firingTimer += deltaTime;
        this.readyToFire = false;
      }
      if (input.keys.indexOf(" ") !== -1) {
        if (this.readyToFire) {
          // this.sound.play();
          this.readyToFire = false;
          projectiles.push(
            new Projectile(
              this.x + this.w / 2,
              this.y + this.h / 2,
              this.direction
            )
          );
        }
      }
    } //end firing
    reset() {
      this.x = Math.random() * (CANVAS_WIDTH - this.w);
      this.y = Math.random() * (CANVAS_HEIGHT - this.h);
      this.vx = 0; //Math.random() * 10
      this.vy = 0; //Math.random() * 10
      this.frameY = 2;
      this.direction = "DOWN";
    } //end reset
  } //end player class

  class Box {
    constructor(box_health, image) {
      this.spriteW = 96;
      this.spriteH = 96;
      if (image === demonImage) {
        this.spriteW = 96 * 2;
        this.spriteH = 96 * 2;
      }
      this.w = this.spriteW / 1.5;
      this.h = this.spriteH / 1.5;
      this.x = Math.random() * (CANVAS_WIDTH - this.w);
      this.y = Math.random() * (CANVAS_HEIGHT - this.h);
      this.vx = Math.random() * 4 - 2;
      this.vy = Math.random() * 4 - 2;
      this.health = box_health
      this.image = image

      this.frameX = 0;
      this.frameY = 3;
      this.maxFrames = 4; //or three if using the others
      this.sound = new Audio();
      this.sound.src = "assets/sounds/laserShoot.wav";

      //animation timing
      this.fps = 12;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;

      //new vars
      this.markedForDeletion = false;
    } //end constructor

    update(deltaTime) {
      ////animation
      if (this.frameTimer > this.frameInterval) {
        this.frameTimer = 0;
        this.frameX = (this.frameX + 1) % this.maxFrames;
      } else {
        this.frameTimer += deltaTime;
      }
      if (Math.abs(this.vx) > Math.abs(this.vy)) {
        if (this.vx > 0) {
          this.frameY = 0;
        } else {
          this.frameY = 1;
        }
      } else {
        if (this.vy > 0) {
          this.frameY = 3;
        } else {
          this.frameY = 2;
        }
      }

      ////movement
      this.x += this.vx;
      this.y += this.vy;
      //   if x is bigger than cw then make vx reverse
      if (this.x + this.w > CANVAS_WIDTH || this.x < 0) {
        this.vx = this.vx * -1;
      }
      if (this.y + this.h > CANVAS_HEIGHT || this.y < 0) {
        this.vy = this.vy * -1;
      }
    } //end update
    display() {
      // cxt.fillStyle = this.color;
      // cxt.strokeRect(this.x, this.y, this.w, this.h);
      cxt.drawImage(
        this.image,
        this.frameX * this.spriteW,
        this.frameY * this.spriteH,
        this.spriteW,
        this.spriteH,
        this.x,
        this.y,
        this.w,
        this.h
      );
    } //end display
    readyToRemove() {
      this.markedForDeletion = true;
    } //end ready to remove
  } //end box class

  ///////////////////////
  function boxIntersect(b1, b2) {
    if (
      b1.x > b2.x + b2.w ||
      b1.x + b1.w < b2.x ||
      b1.y > b2.y + b2.h ||
      b1.y + b1.h < b2.y
    ) {
      return false;
    } else {
      return true;
    }
  } //end box intersect
  ////////////////
  function restartGame() {
    player.reset();
    score = 0;
    health = 200;
    projectiles = [];
    gameOverLose = false;
    gameOverWin = false;
    boxes = [];
    for (let i = 0; i < numberOfBoxes; i++) {
      boxes[i] = new Box(2, spriteImage);
    }
    winTimer = 2;
    bossSpawned = false;
    animate(0);
  } //end reset
  /////////////////
  function drawUIstuff() {
    ///UI stuff
    cxt.fillStyle = "black";
    cxt.font = "24px Impact";
    cxt.textAlign = "left";
    cxt.fillText(`Score: ${score}`, 25, 40);
    cxt.fillText(`Health: ${Math.floor(health)}`, 25, 70);

    if (gameOverLose === false) {
      if (gameOverWin === false) {
        if (bossSpawned) {
          if (boxes.length > 0) {
            cxt.fillStyle = "red";
            cxt.font = "40px Impact";
            cxt.textAlign = "middle";
            cxt.fillText(`BOSS HEALTH: ${boxes[0].health}`, CANVAS_WIDTH / 2, 40);
          }
        }
      }
    }
    if (gameOverLose) {
      cxt.fillStyle = "rgba(0,0,0,0.5)";
      cxt.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      cxt.fillStyle = "white";
      cxt.font = "48px Impact";
      cxt.textAlign = "center";
      cxt.fillText("L", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      cxt.fillStyle = "red";
      cxt.fillText("Click to play again", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    } else if (gameOverWin) {
      cxt.fillStyle = "rgba(0,0,0,0.5)";
      cxt.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      cxt.fillStyle = "white";
      cxt.font = "48px Impact";
      cxt.textAlign = "center";
      cxt.fillText("Official Nerd award granted", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      cxt.fillStyle = "red";
      cxt.fillText("Click to play again", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    }
  } //end ui
  //////////////////

  let boxes = [];
  let numberOfBoxes = 10;
  for (let i = 0; i < numberOfBoxes; i++) {
    boxes[i] = new Box(2, spriteImage);
  }

  let player = new Player();

  let lastTime = 0;
  let input = new InputHandler();
  let projectiles = [];
  let score = 0;
  let health = 200;
  let gameOverLose = false;
  let gameOverWin = false;

  let winTimer = 2

  let bossSpawned = false;

  ///////////////////////////////
  function animate(timeStamp) {
    //timing control
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    //the next line clears the canvas
    cxt.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ////sprite stuff
    for (let i = 0; i < boxes.length; i++) {
      boxes[i].update(deltaTime);
      boxes[i].display();
    }

    projectiles.forEach((object) => {
      object.update();
      object.display();
    });
    player.update(deltaTime);
    player.display();

    //check collisions
    for (let j = 0; j < boxes.length; j++) {
      //boxes vs projectiles
      for (let k = 0; k < projectiles.length; k++) {
        if (boxIntersect(boxes[j], projectiles[k])) {
          boxes[j].health--;
          if (boxes[j].health < 1){
            boxes[j].readyToRemove()
          }
          projectiles[k].readyToRemove();
          score++;
        }
      }
      //boxes vs player
      if (boxIntersect(boxes[j], player)) {
        health -= 1;
        if (health <= 0) {
          gameOverLose = true;
        }
      }
    }
    //remove dead items
    boxes = boxes.filter((object) => object.markedForDeletion === false);
    projectiles = projectiles.filter(
      (object) => object.markedForDeletion === false
    );
    if (boxes.length === 0){
      if (bossSpawned) {
        winTimer --;
      } else {
        boxes.push(new Box(100, demonImage));
        bossSpawned = true;
      }
    } 
    if (winTimer <= 0) {
      gameOverWin = true;
    }

    drawUIstuff();
    if (gameOverLose === false && gameOverWin === false)
      requestAnimationFrame(animate);
  }
  animate(0);
})