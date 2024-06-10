class StartMenu extends Phaser.Scene{

    constructor(){
        super("startMenu");

        this.helpScreen = false;
        this.creditsScreen = false;
        this.data
        this.flashed = false;
        this.flashTimer = 60;
    }

    preload(){
        this.load.setPath("./assets/");
        this.load.image("ufo", "PlayerUFO.png")
        this.load.image("fighter", "FighterEnemy.png");
        this.load.image("charger", "ChargerEnemy.png");
        this.load.image("xorp", "Xorp.png");
        this.load.image("bolt", "EnergyBolt.png");

        this.load.audio("menusound", "UISound.ogg");
    }

    create(){

        this.titleText = this.add.text(400, 120, "XORP DEFENSE", {fontFamily: 'PressStart'}).setColor('#11ff11').setOrigin(0.5,0.5);
        this.titleText.setFontSize(48);
        this.SPromptText = this.add.text(400, 200, "Press SPACE to play", {fontFamily: 'PressStart'}).setColor('#11ff11').setOrigin(0.5,0.5);
        this.SPromptText.setFontSize(16);
        this.HPromptText = this.add.text(400, 240, "Press H for help", {fontFamily: 'PressStart'}).setColor('#11ff11').setOrigin(0.5,0.5);
        this.HPromptText.setFontSize(12);
        this.HelpText = this.add.text(400, 260, "You are Glorpulon, renowned pilot of the Xyrion.\nYour homeworld of Xorp is being\ninvaded by sinister humans.\nFly the Xyrion and save your people!\nA and D to move, space to fire.", {fontFamily: 'PressStart'}).setColor('#11ff11').setOrigin(0.5,0.5);
        this.HelpText.setFontSize(14);
        this.HelpText.visible = false;
        this.CPromptText = this.add.text(400, 260, "Press C for credits", {fontFamily: 'PressStart'}).setColor('#11ff11').setOrigin(0.5,0.5);
        this.CPromptText.setFontSize(12);
        this.CreditsText = this.add.text(400, 260, "Created by Caroly Hope with Phaser\nAll art and sound assets from Kenney Assets\nPress Start Font by codeman38\nFont and asset links can be found in README", {fontFamily: 'PressStart'}).setColor('#11ff11').setOrigin(0.5,0.5);
        this.CreditsText.setFontSize(14);
        this.CreditsText.visible = false;

        this.xorp = this.add.sprite(400, 1200, "xorp");
        this.xorp.setScale(1);
        
        this.fighter = this.add.sprite(600, 420, "fighter");
        this.fighter.scaleX = .9;
        this.fighter.scaleY = 1.2;

        this.ufo = this.add.sprite(200, 600, "ufo");
        this.ufo.setScale(1.5);

        this.fighter.rotation =  Phaser.Math.Angle.Between(600, 440, 200, 600) -Math.PI/2;

        let lpoints = [550, 440, 300, 560];
        this.lpath = new Phaser.Curves.Spline(lpoints);

        this.bolt  = this.add.follower(this.lpath, 550, 440, "bolt");
        this.bolt.startFollow({ //begin following path
            from: 0,
            to: 1,
            delay: 0,
            duration: 1200,
            ease: 'Linear',
            repeat: -1,
            yoyo: false,
            rotateToPath: true,
            rotationOffset: 90
        });


        let hKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
        let cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        let sBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        

        hKey.on('down', (key, event) => {
            this.sound.play("menusound");
            if(!this.helpScreen){
                this.helpScreen = true;
                this.creditsScreen = false;
                
                this.CPromptText.visible = false;
                this.HPromptText.visible = false;
                this.CreditsText.visible = false;
                this.HelpText.visible = true;
            }
            else{
                this.helpScreen = false;

                this.CPromptText.visible = true;
                this.HPromptText.visible = true;
                this.HelpText.visible = false;
            }
        });

        cKey.on('down', (key, event) => {
            this.sound.play("menusound");
            if(!this.creditsScreen){
                this.creditsScreen = true;
                this.helpScreen = false;
                
                this.CPromptText.visible = false;
                this.HPromptText.visible = false;
                this.HelpText.visible = false;
                this.CreditsText.visible = true;
            }
            else{
                this.creditsScreen = false;

                this.CPromptText.visible = true;
                this.HPromptText.visible = true;
                this.CreditsText.visible = false;
            }
        });

        sBar.on('down', (key, event) => {
            this.sound.play("menusound");
            score = 0;
            lives = 3;
            waves = 1;
            //this.scene.restart('defense');
            this.scene.start('defense');
            //this.scene.stop();
        });


        /*fetch("./src/Highscores.JSON").then(
            (response) => response.json()
        ).then(
            (json) => {
                this.data = json;
                this.data.Scores.push(score);
                co
            }
        );*/


    }

    update(){
        this.ufo.rotation += .03;
        if(this.flashTimer <= 0){
            this.flashTimer = 60;
            if(this.flashed){
                this.flashed = false;
                this.SPromptText.visible = true;
            }
            else{
                this.flashed = true;
                this.SPromptText.visible = false;
            }
        }
        this.flashTimer--;
    }
}