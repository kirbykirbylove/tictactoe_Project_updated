// GameManager.ts
import { _decorator, Component, Prefab, Node, instantiate, SpriteFrame, Label, Color, Button, Sprite } from 'cc';
import { Cell } from './Cell';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Prefab)
    cellPrefab: Prefab = null!;
    @property(Node)
    gridNode: Node = null!;
    @property(Label)
    statusLabel: Label = null!;
    @property(SpriteFrame)
    oSprite: SpriteFrame = null!;
    @property(SpriteFrame)
    xSprite: SpriteFrame = null!;
    @property(Button)
    resetButton: Button = null!;
    @property(Sprite)
    resultSprite: Sprite = null!;

    private cells: Cell[] = [];
    private board = Array(9).fill(0);  // 0=空, 1=玩家, 2=AI
    private aiTurn = false;
    private wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

    start() {
        this.createGrid();
        this.resetButton?.node.on(Button.EventType.CLICK, this.reset, this);
        this.reset();
    }

    private createGrid() {
        this.cells = [];
        // 找到所有Position節點並按名稱排序
        const positions = this.gridNode.children
            .filter(node => node.name.startsWith('Pos'))
            .sort((a, b) => {
                const aNum = parseInt(a.name.replace('Pos', ''));
                const bNum = parseInt(b.name.replace('Pos', ''));
                return aNum - bNum;
            });

        // 在每個Position上生成Cell
        positions.forEach((posNode, i) => {
            const cellNode = instantiate(this.cellPrefab);
            posNode.addChild(cellNode);
            const cell = cellNode.getComponent(Cell)!;
            cell.init(i, this);
            this.cells.push(cell);
        });
    }

    public handleCellClick(index: number) {
        if (this.aiTurn || this.board[index]) return;
        
        // 玩家下棋
        this.board[index] = 1;
        this.cells[index].setMark('O', this.oSprite);
        
        if (this.checkEnd()) return;
        
        // AI回合開始 - 立即鎖定防連點
        this.aiTurn = true;
        this.setAllInteractable(false);
        
        this.scheduleOnce(() => {
            this.aiMove();
            if (!this.checkEnd()) {
                // AI完成，解鎖玩家回合
                this.aiTurn = false;
                this.setAllInteractable(true);
            }
        }, 0.15);
    }

    private aiMove() {
        const empties = this.board.map((v, i) => v ? -1 : i).filter(x => x >= 0);
        if (!empties.length) return;
        
        let move = empties[Math.random() * empties.length | 0];
        if (Math.random() < 0.7) {
            let best = -999;
            for (const i of empties) {
                this.board[i] = 2;
                const score = this.minimax(0, false);
                this.board[i] = 0;
                if (score > best) { best = score; move = i; }
            }
        }
        
        this.board[move] = 2;
        this.cells[move].setMark('X', this.xSprite);
    }

    private minimax(depth: number, isMax: boolean): number {
        const w = this.getWinner();
        if (w === 2) return 10 - depth;
        if (w === 1) return depth - 10;
        if (this.board.every(x => x)) return 0;
        
        let best = isMax ? -999 : 999;
        for (let i = 0; i < 9; i++) {
            if (!this.board[i]) {
                this.board[i] = isMax ? 2 : 1;
                const score = this.minimax(depth + 1, !isMax);
                this.board[i] = 0;
                best = isMax ? Math.max(best, score) : Math.min(best, score);
            }
        }
        return best;
    }

    private getWinner(): number {
        for (const [a,b,c] of this.wins) {
            if (this.board[a] && this.board[a] === this.board[b] && this.board[b] === this.board[c]) 
                return this.board[a];
        }
        return 0;
    }

    private checkEnd(): boolean {
        const winner = this.getWinner();
        if (winner) {
            this.statusLabel.string = 'WIN';
            this.statusLabel.color = new Color(255, 215, 0);
            this.resultSprite.spriteFrame = winner === 1 ? this.oSprite : this.xSprite;
            this.setAllInteractable(false);
            return true;
        }
        if (this.board.every(x => x)) {
            this.statusLabel.string = 'A DRAW!!!';
            this.statusLabel.color = new Color(0, 125, 255);
            this.resultSprite.spriteFrame = null;
            return true;
        }
        return false;
    }

    private setAllInteractable(enabled: boolean) {
        this.cells.forEach((cell, i) => {
            if (!this.board[i] || !enabled) {
                cell.setInteractable(enabled);
            }
        });
    }

    public reset() {
        this.board.fill(0);
        this.aiTurn = false;
        this.statusLabel.string = '';
        this.resultSprite.spriteFrame = null;
        this.cells.forEach((cell, i) => cell.init(i, this));
    }
}


// // GameManager.ts
// import { _decorator, Component, Prefab, Node, instantiate, SpriteFrame, Label, Color, Button, Sprite } from 'cc';
// import { Cell } from './Cell';
// const { ccclass, property } = _decorator;

// @ccclass('GameManager')
// export class GameManager extends Component {
//     @property(Prefab)
//     cellPrefab: Prefab = null!;
//     @property(Node)
//     gridNode: Node = null!;
//     @property(Label)
//     statusLabel: Label = null!;
//     @property(SpriteFrame)
//     oSprite: SpriteFrame = null!;
//     @property(SpriteFrame)
//     xSprite: SpriteFrame = null!;
//     @property(Button)
//     resetButton: Button = null!;
//     @property(Sprite)
//     resultSprite: Sprite = null!;

//     private cells: Cell[] = [];
//     private board = Array(9).fill(0);  // 0=空, 1=玩家, 2=AI
//     private aiTurn = false;
//     private wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

//     start() {
//         this.createGrid();
//         this.resetButton?.node.on(Button.EventType.CLICK, this.reset, this);
//         this.reset();
//     }

//     private createGrid() {
//         this.cells = this.gridNode.children.length === 9 
//             ? this.gridNode.children.map((n, i) => { const c = n.getComponent(Cell)!; c.init(i, this); return c; })
//             : (this.gridNode.removeAllChildren(), Array.from({ length: 9 }, (_, i) => {
//                 const node = instantiate(this.cellPrefab);
//                 this.gridNode.addChild(node);
//                 const cell = node.getComponent(Cell)!;
//                 cell.init(i, this);
//                 return cell;
//             }));
//     }

//     public handleCellClick(index: number) {
//         if (this.aiTurn || this.board[index]) return;
        
//         // 玩家下棋
//         this.board[index] = 1;
//         this.cells[index].setMark('O', this.oSprite);
        
//         if (this.checkEnd()) return;
        
//         // AI回合開始 - 立即鎖定防連點
//         this.aiTurn = true;
//         this.setAllInteractable(false);
        
//         this.scheduleOnce(() => {
//             this.aiMove();
//             if (!this.checkEnd()) {
//                 // AI完成，解鎖玩家回合
//                 this.aiTurn = false;
//                 this.setAllInteractable(true);
//             }
//         }, 0.15);
//     }

//     private aiMove() {
//         const empties = this.board.map((v, i) => v ? -1 : i).filter(x => x >= 0);
//         if (!empties.length) return;
        
//         let move = empties[Math.random() * empties.length | 0];
//         if (Math.random() < 0.7) {
//             let best = -999;
//             for (const i of empties) {
//                 this.board[i] = 2;
//                 const score = this.minimax(0, false);
//                 this.board[i] = 0;
//                 if (score > best) { best = score; move = i; }
//             }
//         }
        
//         this.board[move] = 2;
//         this.cells[move].setMark('X', this.xSprite);
//     }

//     private minimax(depth: number, isMax: boolean): number {
//         const w = this.getWinner();
//         if (w === 2) return 10 - depth;
//         if (w === 1) return depth - 10;
//         if (this.board.every(x => x)) return 0;
        
//         let best = isMax ? -999 : 999;
//         for (let i = 0; i < 9; i++) {
//             if (!this.board[i]) {
//                 this.board[i] = isMax ? 2 : 1;
//                 const score = this.minimax(depth + 1, !isMax);
//                 this.board[i] = 0;
//                 best = isMax ? Math.max(best, score) : Math.min(best, score);
//             }
//         }
//         return best;
//     }

//     private getWinner(): number {
//         for (const [a,b,c] of this.wins) {
//             if (this.board[a] && this.board[a] === this.board[b] && this.board[b] === this.board[c]) 
//                 return this.board[a];
//         }
//         return 0;
//     }

//     private checkEnd(): boolean {
//         const winner = this.getWinner();
//         if (winner) {
//             this.statusLabel.string = 'WIN';
//             this.statusLabel.color = new Color(255, 215, 0);
//             this.resultSprite.spriteFrame = winner === 1 ? this.oSprite : this.xSprite;
//             this.setAllInteractable(false);
//             return true;
//         }
//         if (this.board.every(x => x)) {
//             this.statusLabel.string = 'A DRAW!!!';
//             this.statusLabel.color = new Color(0, 125, 255);
//             this.resultSprite.spriteFrame = null;
//             return true;
//         }
//         return false;
//     }

//     private setAllInteractable(enabled: boolean) {
//         this.cells.forEach((cell, i) => {
//             if (!this.board[i] || !enabled) {
//                 cell.setInteractable(enabled);
//             }
//         });
//     }

//     public reset() {
//         this.board.fill(0);
//         this.aiTurn = false;
//         this.statusLabel.string = '';
//         this.resultSprite.spriteFrame = null;
//         this.cells.forEach((cell, i) => cell.init(i, this));
//     }
// }