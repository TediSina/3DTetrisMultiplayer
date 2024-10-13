import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import * as GUI from "@babylonjs/gui/index";

export class GameOver {
    private guiTexture: GUI.AdvancedDynamicTexture;
    private headingText: GUI.TextBlock;
    private scoreText: GUI.TextBlock;
    private maxScoreText: GUI.TextBlock;
    private maxScoreMessage!: GUI.TextBlock;
    private replayMessage: GUI.TextBlock;
    private separator: GUI.Line;
    private fontType: string;

    constructor(finalScore: number, maxScore: number, isNewMaxScore: boolean) {
        this.guiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("GameOverUI");

        this.fontType = "Courier New";

        this.replayMessage = new GUI.TextBlock();
        this.replayMessage.text = "Press anywhere to retry";
        this.replayMessage.color = "lightgray";
        this.replayMessage.fontSize = 35;
        this.replayMessage.fontFamily = this.fontType;
        this.replayMessage.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.replayMessage.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.replayMessage.shadowOffsetX = 3;
        this.replayMessage.shadowOffsetY = 3;
        this.replayMessage.shadowColor = "#000000";
        this.guiTexture.addControl(this.replayMessage);

        this.headingText = new GUI.TextBlock();
        this.headingText.text = "GAME OVER";
        this.headingText.color = "#FF0033";
        this.headingText.fontSize = 200;
        this.headingText.fontFamily = this.fontType;
        this.headingText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.headingText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.headingText.top = "10%";
        this.headingText.shadowOffsetX = 4;
        this.headingText.shadowOffsetY = 4;
        this.headingText.shadowColor = "black";
        this.guiTexture.addControl(this.headingText);

        this.separator = new GUI.Line();
        this.separator.lineWidth = 5;
        this.separator.color = "#FFFFFF";
        this.separator.x1 = 0;
        this.separator.y1 = 400;
        this.separator.x2 = 10000;
        this.separator.y2 = 400;
        this.guiTexture.addControl(this.separator);

        this.scoreText = new GUI.TextBlock();
        this.scoreText.text = "Your Score: " + finalScore;
        this.scoreText.color = "#FFFFFF";
        this.scoreText.fontSize = 50;
        this.scoreText.fontFamily = this.fontType;
        this.scoreText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.scoreText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.scoreText.top = "20%";
        this.scoreText.shadowOffsetX = 2;
        this.scoreText.shadowOffsetY = 2;
        this.scoreText.shadowColor = "#000000";
        this.guiTexture.addControl(this.scoreText);

        this.maxScoreText = new GUI.TextBlock();
        this.maxScoreText.text = "Max Score: " + maxScore;
        this.maxScoreText.color = "#FFD700";
        this.maxScoreText.fontSize = 50;
        this.maxScoreText.fontFamily = this.fontType;
        this.maxScoreText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.maxScoreText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.maxScoreText.top = "30%";
        this.maxScoreText.shadowOffsetX = 2;
        this.maxScoreText.shadowOffsetY = 2;
        this.maxScoreText.shadowColor = "#000000";
        this.guiTexture.addControl(this.maxScoreText);

        if (finalScore === maxScore && isNewMaxScore) {
            this.maxScoreMessage = new GUI.TextBlock();
            this.maxScoreMessage.text = "New High Score!";
            this.maxScoreMessage.color = "#00FF00";
            this.maxScoreMessage.fontSize = 60;
            this.maxScoreMessage.fontFamily = this.fontType;
            this.maxScoreMessage.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            this.maxScoreMessage.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            this.maxScoreMessage.top = "40%";
            this.maxScoreMessage.shadowOffsetX = 3;
            this.maxScoreMessage.shadowOffsetY = 3;
            this.maxScoreMessage.shadowColor = "#000000";
            this.guiTexture.addControl(this.maxScoreMessage);
        }
    }

    /**
     * Disposes of the GUI texture, hiding the game over screen.
     */
    public hide() {
        this.guiTexture.dispose();
    }
}
