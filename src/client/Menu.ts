import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import * as GUI from "@babylonjs/gui/index";

export class Menu {
    private ui: GUI.AdvancedDynamicTexture;
    private backgroundPanel: GUI.Rectangle;
    private titleText: GUI.TextBlock;
    private subtitleText: GUI.TextBlock;
    private creditsText: GUI.TextBlock;
    private startPrompt: GUI.TextBlock;
    private separatorLine: GUI.Line;
    private fontFamily: string;

    /**
     * Creates the main menu for the game.
     * @constructor
     */
    constructor() {
        this.ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("GameUI");

        this.fontFamily = "Monospace";

        this.backgroundPanel = new GUI.Rectangle();
        this.backgroundPanel.background = "#1e1e1e";
        this.backgroundPanel.alpha = 0.85;
        this.backgroundPanel.thickness = 0;
        this.ui.addControl(this.backgroundPanel);

        this.titleText = new GUI.TextBlock();
        this.titleText.text = "3D Tetris";
        this.titleText.color = "#FF6600";
        this.titleText.fontSize = 250;
        this.titleText.fontFamily = this.fontFamily;
        this.titleText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.titleText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.titleText.top = "-40%";
        this.titleText.shadowColor = "#000000";
        this.titleText.shadowOffsetX = 5;
        this.titleText.shadowOffsetY = 5;
        this.ui.addControl(this.titleText);

        this.subtitleText = new GUI.TextBlock();
        this.subtitleText.text = "The Ultimate Block Experience";
        this.subtitleText.color = "white";
        this.subtitleText.fontSize = 70;
        this.subtitleText.fontFamily = this.fontFamily;
        this.subtitleText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.subtitleText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.subtitleText.top = "-25%";
        this.subtitleText.shadowColor = "#000000";
        this.subtitleText.shadowOffsetX = 3;
        this.subtitleText.shadowOffsetY = 3;
        this.ui.addControl(this.subtitleText);

        this.separatorLine = new GUI.Line();
        this.separatorLine.lineWidth = 4;
        this.separatorLine.color = "white";
        this.separatorLine.x1 = 0;
        this.separatorLine.y1 = 500;
        this.separatorLine.x2 = 10000;
        this.separatorLine.y2 = 500;
        this.separatorLine.alpha = 0.2;
        this.ui.addControl(this.separatorLine);

        this.creditsText = new GUI.TextBlock();
        this.creditsText.text = "Developed by Tedi Sina";
        this.creditsText.color = "gray";
        this.creditsText.fontSize = 50;
        this.creditsText.fontFamily = this.fontFamily;
        this.creditsText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.creditsText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.creditsText.top = "-15%";
        this.ui.addControl(this.creditsText);

        this.startPrompt = new GUI.TextBlock();
        this.startPrompt.text = "Tap anywhere to begin";
        this.startPrompt.color = "#FFCC00";
        this.startPrompt.fontSize = 40;
        this.startPrompt.fontFamily = this.fontFamily;
        this.startPrompt.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.startPrompt.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.startPrompt.top = "-5%";
        this.startPrompt.shadowColor = "#000000";
        this.startPrompt.shadowOffsetX = 2;
        this.startPrompt.shadowOffsetY = 2;
        this.ui.addControl(this.startPrompt);

        this.startPrompt.onPointerEnterObservable.add(() => {
            this.startPrompt.color = "white";
        });
        this.startPrompt.onPointerOutObservable.add(() => {
            this.startPrompt.color = "#FFCC00";
        });
    }

    /**
     * Removes all of the UI elements from the screen.
     */
    public hide() {
        this.backgroundPanel.dispose();
        this.titleText.dispose();
        this.subtitleText.dispose();
        this.creditsText.dispose();
        this.startPrompt.dispose();
        this.separatorLine.dispose();
    }
}
