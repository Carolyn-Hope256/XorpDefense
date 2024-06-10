class GameOver extends Phaser.Scene{

    constructor(){
        super("gameOver");

        this.scoreScreen = false;
        this.highScores = [];
    }

    preload(){
        this.load.setPath("./assets/");
        this.load.image("fighter", "FighterEnemy.png");
        this.load.image("charger", "ChargerEnemy.png");
        this.load.image("xorp", "Xorp.png");
        this.load.audio("menusound", "UISound.ogg");
    }

    create(){
        scores.push(score);
        scores.sort(compareNumbers);
        scores.reverse();
        console.log(scores);

        if(scores.length > 10){
            this.highScores = scores.slice(0, 10);
        }
        else{
            this.highScores = scores;
        }


        this.endText = this.add.text(400, 120, "GAME OVER", {fontFamily: 'PressStart'}).setColor('#11ff11').setOrigin(0.5,0.5);
        this.endText.setFontSize(36);
        this.scoreText = this.add.text(400, 180, "Score: " + score, {fontFamily: 'PressStart'}).setColor('#11ff11').setOrigin(0.5,0.5);
        this.waveText = this.add.text(400, 220, "Survived " + waves + " waves", {fontFamily: 'PressStart'}).setColor('#11ff11').setOrigin(0.5,0.5);
        if(waves == 1){
            this.waveText.text = "Survived " + waves + " wave";
        }
        this.RSPromptText = this.add.text(400, 260, "Press SPACE to restart", {fontFamily: 'PressStart'}).setColor('#11ff11').setOrigin(0.5,0.5);
        this.RSPromptText.setFontSize(12);
        this.HSPromptText = this.add.text(400, 300, "Press H for highscores", {fontFamily: 'PressStart'}).setColor('#11ff11').setOrigin(0.5,0.5);
        this.HSPromptText.setFontSize(14);

        this.HSHeaderText = this.add.text(400, 300, "Highscores:", {fontFamily: 'PressStart'}).setColor('#11ff11').setOrigin(0.5,0.5);
        this.HSHeaderText.setFontSize(14);
        this.HSHeaderText.visible = false;

        this.HSString = "";
        for(let s = 1; s <= this.highScores.length; s++){
            this.HSString += s + ": " + this.highScores[s - 1] + "\n";
        }

        this.HSText = this.add.text(400, 360, this.HSString, {fontFamily: 'PressStart'}).setColor('#11ff11').setOrigin(0.5, 0);
        this.HSText.visible = false;

        this.xorp = this.add.sprite(400, 700, "xorp");
        this.xorp.setScale(.4);
        
        this.fighter = this.add.sprite(400, 420, "fighter");
        this.fighter.scaleX = .9;
        this.fighter.scaleY = 1.2;

        this.wingman1 = this.add.sprite(300, 380, "charger");
        this.wingman1.scaleX = .6;
        this.wingman1.scaleY = .8;

        this.wingman2 = this.add.sprite(500, 380, "charger");
        this.wingman2.scaleX = .6;
        this.wingman2.scaleY = .8;

        let hKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
        let sBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        

        hKey.on('down', (key, event) => {
            this.sound.play("menusound");
            if(!this.scoreScreen){
                this.scoreScreen = true;
                this.xorp.visible = false;
                this.fighter.visible = false;
                this.wingman1.visible = false;
                this.wingman2.visible = false;

                this.HSPromptText.visible = false;
                this.HSHeaderText.visible = true;
                this.HSText.visible = true;
                
            }
            else{
                this.scoreScreen = false;
                this.xorp.visible = true;
                this.fighter.visible = true;
                this.wingman1.visible = true;
                this.wingman2.visible = true;

                this.HSHeaderText.visible = false;
                this.HSText.visible = false;
                this.HSPromptText.visible = true;
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
        
    }
}