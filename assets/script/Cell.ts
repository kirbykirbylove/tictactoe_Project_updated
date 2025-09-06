// Cell.ts
import { _decorator, Component, Button, Sprite, SpriteFrame, EventHandler } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Cell')
export class Cell extends Component {
    @property(Sprite)
    sprite: Sprite = null!;
    @property(Button)
    button: Button = null!;
    
    public index = 0;
    public gameManager: { handleCellClick: (i: number) => void } | null = null;

    public init(index: number, mgr: any) {
        this.index = index;
        this.gameManager = mgr;
        this.sprite.spriteFrame = null;
        this.button.interactable = true;
        
        // 使用EventHandler機制
        this.button.clickEvents.length = 0;
        const handler = new EventHandler();
        handler.target = this.node;
        handler.component = 'Cell';
        handler.handler = 'onClick';
        handler.customEventData = String(index);
        this.button.clickEvents.push(handler);
    }

    public setMark(mark: 'O' | 'X', spriteFrame: SpriteFrame) {
        console.log(`設定標記: ${mark}, SpriteFrame:`, spriteFrame);
        console.log('Sprite組件:', this.sprite);
        this.sprite.spriteFrame = spriteFrame;
        this.button.interactable = false;
        console.log('設定完成後的 spriteFrame:', this.sprite.spriteFrame);
    }

    public setInteractable(enabled: boolean) {
        this.button.interactable = enabled;
    }

    public onClick(_evt?: any, customData?: string) {
        if (!this.gameManager) return;
        const index = customData != null ? parseInt(customData) : this.index;
        this.gameManager.handleCellClick(index);
    }
}
