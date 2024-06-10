class Defense extends Phaser.Scene {
    constructor() {
        super("defense");
        
        //Holds player sprite and starting xy
        this.my = {sprite: {}}; 
        this.bodyX = 400;
        this.bodyY = 800;

        //Holds timers for player cooldown, invulnerability, and flash fx 
        this.cooldown = 0;
        this.invulntime = 10;
        this.flashtime = 0;

        //Player engine fx handling
        this.engineVol = .1;
        this.moving = false;
        
        //Preplotted paths for fighter wings and starting points for charger ambushes
        this.wingPaths = [];
        this.chargePoints = [];
        
        //Resets lives, score, wavecount, and initializes the corresponding text
        this.scoreText; 
        this.livesText;
        this.waveText;
        
    }
    
     preload(){
        console.log("Preloading!");
        this.load.setPath("./assets/");
        this.load.image("playerShip", "PlayerUFO.png");
        this.load.image("missile", "PlayerSaw.png");
        this.load.image("fighter", "FighterEnemy.png");
        this.load.image("charger", "ChargerEnemy.png");
        this.load.image("bolt", "EnergyBolt.png");
        this.load.image("blast", "EnergyBlast.png");
        this.load.image("xorp", "Xorp.png");

        this.load.audio("enemykill", "EnemyKill.ogg");
        this.load.audio("blastermiss", "BlasterMiss.ogg");
        this.load.audio("playerdamage", "PlayerDamage.ogg");
        this.load.audio("playerengine", "PlayerEngine.ogg");

        //this.load.bitmapFont("pressStart", "PressStartFont.ttf");
     }
 
     create(){
        console.log("Creating!");
        //Sprite Arrays
        this.blastArray = []; //Array for holding blast FX
        this.missileArray = []; //Player projectile array
        this.projArray = []; //Enemy projectile array
        this.enemArray= []; //Enemy array
        this.fleetArray=[]; //Array of fleets, enemy pattern spawners
        


        let my = this.my;

        my.sprite.main = this.add.sprite(this.bodyX, this.bodyY, "playerShip"); //creating player sprite
        my.sprite.main.setDepth(2)

        this.xorp = this.add.sprite(160, 860, "xorp");
        this.xorp.setScale(.6);
        this.xorp.setDepth(1);

        //Establishing keybinds
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.sBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        //Positioning score and lives text
        this.scoreText = this.add.text(40, 40, "Score: " + score, {fontFamily: 'PressStart'}).setColor('#11ff11');
        this.livesText = this.add.text(40, 60, "Lives: " + lives, {fontFamily: 'PressStart'}).setColor('#11ff11');
        this.waveText = this.add.text(40, 80, "Wave " + waves, {fontFamily: 'PressStart'}).setColor('#11ff11');



        this.scoreText.setFontSize(14);
        this.livesText.setFontSize(14);
        this.waveText.setFontSize(14);

        this.scoreText.setDepth(4);
        this.livesText.setDepth(4);
        this.waveText.setDepth(4);

        this.enginefx = this.sound.add("playerengine");
        this.enginefx.loop = true;
        this.enginefx.play();

        //Establishing potential wing routes and charger origins
        this.wingPaths[0] = [-40, 300, 300, 200, 600, -80];
        this.wingPaths[1] = [840, 300, 500, 200, 200, -80];
        this.wingPaths[2] = [100, -40, 400, 400, 700, -40];
        this.chargePoints = [[-40, 40], [400, -40], [840,40]];
        

        this.fleetArray[0] = new fleet("fighter", this, 1, 4, 800, 1, 45, 160, 40, 80, 360, 40); //Starting wave
    }
 
     update() {
        let my = this.my;

        //Update score, lives, and wave
        this.scoreText.text = "Score: " + score;
        this.livesText.text = "Lives: " + lives;
        this.waveText.text = "Wave " + waves;
        

        my.sprite.main.rotation += .03;//Rotate ufo

        this.moving = false;
        
        //1D movement
        if (this.aKey.isDown) {
            my.sprite.main.x -= 4;
            if (my.sprite.main.x <= 0) my.sprite.main.x = 0;
            this.moving = true;
        }
        if (this.dKey.isDown) {
            my.sprite.main.x += 4;
            if (my.sprite.main.x >= 800) my.sprite.main.x = 800;
            this.moving = true;
        }

        //Increments or decrements player engine volume depending on whether player is moving
        if(this.moving && this.engineVol <.30) this.engineVol += 0.005;
        if(!this.moving && this.engineVol >.05) this.engineVol -= 0.005;
        this.enginefx.setVolume(this.engineVol);

        if(my.sprite.main.visible && this.invulntime > 0 && this.flashtime <= 0){
            my.sprite.main.visible = false;
            this.flashtime = 15;
        }
        if(!my.sprite.main.visible && this.flashtime <= 0){
            my.sprite.main.visible = true;
            this.flashtime = 15;
        }

        //decrement flash duration and invulnerability duration
        if(this.invulntime > 0){ //decrement cooldown 
            this.invulntime--;
        }
        if(this.flashtime > 0){ //decrement cooldown 
            this.flashtime--;
        }
        

        //player attack
        if(this.sBar.isDown && this.cooldown == 0){
            this.cooldown = 60; //reset cooldown

            //Creating a set of points for next bullet path
            let dist = my.sprite.main.y + 50;
            let pts = [
                my.sprite.main.x, my.sprite.main.y,
                ((my.sprite.main.x - 40) + Math.floor(Math.random() * 81)), my.sprite.main.y - Math.floor(dist/3),
                ((my.sprite.main.x - 40) + Math.floor(Math.random() * 81)), my.sprite.main.y - Math.floor(2 * dist/3),
                my.sprite.main.x, -50
            ];
            let curve = new Phaser.Curves.Spline(pts); //create curve

            this.missileArray.push(this.add.follower(curve, my.sprite.main.x, my.sprite.main.y, "missile")); //create projectile follower and add it to missile array
            this.missileArray[this.missileArray.length - 1].setDepth(3);

            this.missileArray[this.missileArray.length - 1].startFollow({ //begin following path
                from: 0,
                to: 1,
                delay: 0,
                duration: 1400,
                ease: 'Sine.easeInOut',
                repeat: 0,
                yoyo: false,
                rotateToPath: false,
                
            });
        }

        if(this.cooldown > 0){ //decrement cooldown 
            this.cooldown--;
        }

        for(let m = 0; m < this.missileArray.length; m++){ //for every player bullet on screen...
            this.missileArray[m].rotation += .12; //rotate the sprite a bit

            //if colliding with an enemy, add the enemy's point value to score and delete it
            for(let e in this.enemArray){
                if(checkcollision(this.missileArray[m], this.enemArray[e].Follower)){
                    score += this.enemArray[e].PointVal;
                    this.enemArray[e].Follower.destroy(true);
                    this.enemArray.splice(e, 1);
                    this.sound.play("enemykill");
                }
            }

            //if out of bounds, cull
            if(this.missileArray[m].y < -40){
                this.missileArray[m].destroy(true);
                this.missileArray.splice(m, 1);
            }
        }

        //for enemy in array...
        for(let m = 0; m < this.enemArray.length; m++){
            
            //fighter-specific behaviors
            if(this.enemArray[m].Type == "fighter"){
                 if(this.enemArray[m].Parked){
                    this.enemArray[m].Follower.rotation =  Phaser.Math.Angle.Between(this.enemArray[m].Follower.x, this.enemArray[m].Follower.y, my.sprite.main.x, my.sprite.main.y) -Math.PI/2;
                 }
                 if(this.enemArray[m].Cooldown <= 0){
                    this.enemArray[m].Cooldown = this.enemArray[m].FireRate;
                    let pts =[this.enemArray[m].Follower.x, this.enemArray[m].Follower.y, my.sprite.main.x, my.sprite.main.y];
                    let firingline = new Phaser.Curves.Spline(pts);
                    this.projArray.push(this.add.follower(firingline, this.enemArray[m].Follower.x, this.enemArray[m].Follower.y, "bolt"));
                    this.projArray[this.projArray.length - 1].setDepth(3);
                    this.projArray[this.projArray.length - 1].startFollow({ //begin following path
                        from: 0,
                        to: 1,
                        delay: 0,
                        duration: 2 * (1000 - this.enemArray[m].Follower.y),
                        ease: 'Linear',
                        repeat: 0,
                        yoyo: false,
                        rotateToPath: true,
                        rotationOffset: 90
                    });

                 }
                 this.enemArray[m].Cooldown--;
                 
            }
            
            //if an enemy has reached the end of it's lifetime, cull
            if(this.enemArray[m].SelfTerm){
                if(this.enemArray[m].Type == "charger"){
                    this.sound.play("enemykill");
                }
                this.enemArray[m].Follower.destroy(true);
                this.enemArray.splice(m, 1);
            }
            else if(this.enemArray[m].Type == "charger"){//if charger type enemy has not been culled, check collision w/ player
                if(checkcollision(this.enemArray[m].Follower, my.sprite.main)){
                    if(this.invulntime <= 0){
                        lives--;
                    }
                    
                    this.invulntime = 90;
                    this.sound.play("playerdamage");
                    this.enemArray[m].Follower.destroy(true);
                    this.enemArray.splice(m, 1);
                }
            }
        }

        //Checking enemy projectile collision with player
        for(let p in this.projArray){
            if(checkcollision(this.projArray[p], my.sprite.main)){
                if(this.invulntime <= 0){
                    lives--;
                    this.invulntime = 90;
                }
                
                this.blastArray.push(new blast(this.projArray[p].x, this.projArray[p].y, "blast", 0.5, this));
                this.projArray[p].destroy(true);
                this.projArray.splice(p, 1);
                this.sound.play("playerdamage");
            }
            else if(this.projArray[p].y + 5 > my.sprite.main.y){
                this.blastArray.push(new blast(this.projArray[p].x, this.projArray[p].y, "blast", 0.5, this));
                this.projArray[p].destroy(true);
                this.projArray.splice(p, 1);
                this.sound.play("blastermiss");
            }
        }
        
        //Spawning ships from fleet
        for(let fl in this.fleetArray){
            if(this.fleetArray[fl].TimeTil <= 0){
                this.enemArray.push(this.fleetArray[fl].nextShip());
                this.enemArray[this.enemArray.length-1].Follower.setDepth(2);
                this.fleetArray[fl].TimeTil = this.fleetArray[fl].Delay;
            }
            this.fleetArray[fl].TimeTil--;
            if(this.fleetArray[fl].Exhausted){
                this.fleetArray.splice(fl, 1);
            }
        }

        for(let b in this.blastArray){
            this.blastArray[b].Lifetime++;
            if(this.blastArray[b].Lifetime >= 15){
                this.blastArray[b].Sprite.destroy(true);
                this.blastArray.splice(b, 1);
            }
        }

        //Next wave protocol
        if(this.fleetArray.length == 0 && this.enemArray == 0){
            waves++;
            lives++;
            for(let f = 0; f < waves; f++){
                let typ = intInRange(0, 2);
                if(f == 0 || typ <= 0){
                    this.fleetArray[f] = new fleet("fighter", this, min(intInRange(2, waves), 7), intInRange(2, waves), 800, 1, intInRange(30, 60), intInRange(60*f, 180*waves), Math.floor(45*waves/2), 60 * waves, 160*waves, 40*waves);
                }
                else if(typ == 1){
                    this.fleetArray[f] = new wing("fighter", this, this.wingPaths[intInRange(0,2)], 1200, intInRange(3, waves * 2), 45, intInRange(60*f, 180*waves), 45, 80, 600, 120*waves)
                }
                else if(typ == 2){
                    let pt = this.chargePoints[intInRange(0, 2)];
                    this.fleetArray[f] = new chargerRun("charger", this, pt[0], pt[1], this.my.sprite.main, intInRange(0,1), 15, intInRange(60*f, 180*waves), 80*waves);
                }
            }
        }
        
        if(lives <= 0){
            this.enginefx.stop();
            this.scene.start("gameOver");
        }

        //console.log(this.missileArray.length);
        console.log(this.enemArray.length);
    }

    

    
 
}

//checks if the center of sprite 1 is within the bounding box of sprite 2
function checkcollision(obj1, obj2) {
    colliding = true;
    if(obj1.x < (obj2.x - (obj2.displayWidth/2)) || obj1.x > (obj2.x + (obj2.displayWidth/2))){
        colliding = false;
    }
    else if(obj1.y < (obj2.y - (obj2.displayHeight/2)) || obj1.y > (obj2.y + (obj2.displayHeight/2))){
        colliding = false;
    }
    return(colliding);
}