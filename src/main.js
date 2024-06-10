// Jim Whitehead
// Created: 4/14/2024
// Phaser: 3.70.0
//
// Cubey
//
// An example of putting sprites on the screen using Phaser
// 
// Art assets from Kenny Assets "Shape Characters" set:
// https://kenney.nl/assets/shape-characters

// debug with extreme prejudice
"use strict"

let score = 0;
let lives = 3;
let waves = 1;
let scores = [];
// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 800,
    height: 1000,
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [StartMenu, Defense, GameOver]
}

const game = new Phaser.Game(config);



//Enemy Classes
class fighter { //Basic enemy fighter, fires projectiles at player
    
    constructor(sprite, path, deathpath, pointval, cooldown, startcooldown, scene){
        this.Sprite = sprite;
        //this.Sprite.scaleX = 0.6
        this.SelfTerm = false;
        this.Flying = true;
        this.DeathPath = deathpath;
        this.PointVal = pointval;

        this.Type = "fighter";
        this.Cooldown = startcooldown;
        console.log(startcooldown);
        this.FireRate = cooldown;
        this.Parked = false;

        this.Path = new Phaser.Curves.Spline(path);
        this.Follower = scene.add.follower(this.Path, path[0], path[1], this.Sprite);
        this.Follower.scaleX = 0.6;
        this.Follower.scaleY = 0.8;
        
        this.Follower.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            dusration: 1200,
            ease: 'Sine.easeIn',
            repeat: 0,
            yoyo: false,
            rotateToPath: true,
            rotationOffset: -90,
            onComplete: function(){
                if(this.DeathPath){
                    this.SelfTerm = true;
                }
                else{
                    this.Parked = true;
                }
                
            },
            callbackScope: this
        });
    }


}

class charger { //Attempts to charge at the player and collide with them 
    
    constructor(sprite, path, pointval, scene){
        this.Sprite = sprite;
        //this.Sprite.scaleX = 0.6
        this.SelfTerm = false;
        this.Flying = true;
        this.PointVal = pointval;

        this.Type = "charger";

        this.Path = new Phaser.Curves.Spline(path);
        this.Follower = scene.add.follower(this.Path, path[0], path[1], this.Sprite);
        this.Follower.scaleX = 0.6;
        this.Follower.scaleY = 0.8;
        
        this.Follower.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 1200,
            ease: 'Sine.easeIn',
            repeat: 0,
            yoyo: false,
            rotateToPath: true,
            rotationOffset: -90,
            onComplete: function(){
                this.SelfTerm = true;
                //this.SelfTerm = true;
            },
            callbackScope: this
        });
    }


}



class fleet {

    constructor(sprite, scene, rows, columns, swidth, density, delay, startdelay, minSCooldown, maxSCooldown, cooldown, pointval){
        this.Sprite = sprite;
        this.Scene = scene;

        this.Rows = rows;
        this.Columns = columns;
        this.ScreenWidth = swidth;
        this.XStep = Math.floor((swidth-80)/(this.Columns + 1));

        this.TargRow = 1;
        this.TargColumn = 1;
        this.Exhausted = false;
        this.Density = density;
        this.Delay = delay;
        this.TimeTil = startdelay;
        
        this.MinCooldown = minSCooldown;
        this.MaxCooldown = maxSCooldown;
        this.Cooldown = cooldown;
        this.PointVal = pointval;
    }
    nextShip(){
        let path =[
            Math.floor((Math.random() * (this.ScreenWidth-80)) + 40),
            -40,
            40 + (this.XStep * this.TargColumn),
            70*this.TargRow
        ];
        if(this.TargColumn >= this.Columns){
            if(this.TargRow >= this.Rows){
                this.Exhausted = true;
            }
            else{
                this.TargColumn = 1;
                this.TargRow++;
            }
        }
        else{
            this.TargColumn++;
        }
        return(new fighter(this.Sprite, path, false, this.PointVal, this.Cooldown, intInRange(this.MinCooldown, this.MaxCooldown), this.Scene));
    }

}

class wing {

    constructor(sprite, scene, path, pathlength, count, delay, startdelay, minSCooldown, maxSCooldown, cooldown, pointval){
        this.Sprite = sprite;
        this.Scene = scene;

        this.Path = path;
        this.PathLength = pathlength;

        this.ShipsRemaining = count;
        this.Exhausted = false;
        this.Delay = delay;
        this.TimeTil = startdelay;
        
        this.MinCooldown = minSCooldown;
        this.MaxCooldown = maxSCooldown;
        this.Cooldown = cooldown;
        this.PointVal = pointval;
    }
    nextShip(){
        this.ShipsRemaining--;
        if(this.ShipsRemaining <= 0){
            this.Exhausted = true;
        }
        return(new fighter(this.Sprite, this.Path, true, this.PointVal, this.Cooldown, intInRange(this.MinCooldown, this.MaxCooldown), this.Scene));
    }

}

class chargerRun {

    constructor(sprite, scene, x, y, player, flock, delay, startdelay, pointval){
        this.Sprite = sprite;
        this.Scene = scene;
        
        this.x = x;
        this.y = y;
        this.Player = player;

        if(flock){
            this.ShipsRemaining = 3;
        }
        else{
            this.ShipsRemaining = 1;
        }
        
        this.Exhausted = false;
        this.Delay = delay;
        this.TimeTil = startdelay;
        this.PointVal = pointval;
    }
    nextShip(){
        
        let tx = this.Player.x;
        let ty = this.Player.y + 5;
        if(this.ShipsRemaining == 3){
            tx += 100;
        }
        if(this.ShipsRemaining == 2){
            tx -= 100;
        }
        let path = [this.x, this.y, tx, ty];
        
        this.ShipsRemaining--;
        if(this.ShipsRemaining <= 0){
            this.Exhausted = true;
        }
        return(new charger(this.Sprite, path, this.PointVal, this.Scene));

    }
    

}

class blast {
    constructor(x, y, sprite, scale, scene){
        this.Sprite = scene.add.sprite(x, y, sprite);
        this.Sprite.rotation = Math.random();
        this.Sprite.setScale(scale);
        this.Sprite.setDepth(3)
        this.Lifetime = 0;
    }
}

function intInRange(i1, i2){
    let r = i2 - i1;
    return(i1 + Math.floor(Math.random() * (r + 1) ) );
}
//What is in an enemy? Attack, cooldown, path, colision, point value

function min(int1, int2){
    if(int1 < int2){
        return(int1);
    }
    else{
        return(int2);
    }
}

function compareNumbers(a, b) {
    return a - b;
  }