window.onload=function () {

    var Q = Quintus().include("Sprites,Scenes,Input,Anim,UI,Touch,2D").setup({
        width: 1000, // Set the default width to 800 pixels
        height: 600, // Set the default height to 600 pixels

        scaleToFit: true
    }).touch().controls(true);

    //模型
    Q.component("npc", {
        added: function () {
            this.entity.p.y = 400;
            this.entity.p.ahead = 'right';
            this.entity.p.sprite = 'npc';
            this.entity.p.state = 1;
            this.entity.p.type = Q.SPRITE_FRIENDLY,
                this.entity.p.rangeA = this.entity.p.x;
            this.entity.p.rangeB = this.entity.p.x + this.entity.p.range;
            this.entity.on("step", this, "step");
            this.entity.add("animation");
            this.entity.on("walkLeft", this, "walkLeft");
            this.entity.on("walkRight", this, "walkRight");
            this.entity.p.mark = new Q.markOn();

            Q.stage(0).insert(this.entity.p.mark);
        },
        walkLeft: function () {
            this.entity.play("walkLeft")
        },
        walkRight: function () {
            this.entity.play("walkRight")
        },
        step: function () {
            var p = this.entity.p;
            p.mark.p.x = p.x;
            if (p.range != 0) {
                if (p.ahead == 'right') {
                    if (p.x < p.rangeB) {
                        p.x += 1;
                        this.entity.trigger("walkRight");
                    }
                    else {
                        p.ahead = 'left'
                    }
                } else {
                    if (p.x > p.rangeA && p.ahead == 'left') {
                        p.x -= 1;
                        this.entity.trigger("walkLeft");
                    }
                    else {
                        p.ahead = 'right'
                    }
                }
            }
            if (p.state == 0) {
                p.mark.destroy()
            }
        }
    });
    Q.component("enemy", {
        added: function () {
            this.entity.p.ahead = 'left';
            this.entity.p.type = Q.SPRITE_ENEMY;
            this.entity.p.rangeA = this.entity.p.x;
            this.entity.p.gravity = 0;
            this.entity.p.rangeB = this.entity.p.x + this.entity.p.range;
            this.entity.on("step", this, "step");
            this.entity.on("bump.left,bump.right", function (collision) {
                if (collision.obj.isA("player")) {
                    collision.obj.p.blood -= 1;
                    collision.obj.p.x -= 20;
                }
            });
            this.entity.add("animation,2d");
            this.entity.on("walkLeft", this, "walkLeft");
            this.entity.on("walkRight", this, "walkRight");
        },
        walkLeft: function () {
            this.entity.play("walkLeft")
        },
        walkRight: function () {
            this.entity.play("walkRight")
        },
        step: function () {
            var p = this.entity.p;
            if (p.range != 0) {
                if (p.ahead == 'right') {
                    if (p.x < p.rangeB) {
                        p.x += 1;
                        this.entity.trigger("walkRight");
                    }
                    else {
                        p.ahead = 'left'
                    }
                } else {
                    if (p.x > p.rangeA && p.ahead == 'left') {
                        p.x -= 1;
                        this.entity.trigger("walkLeft");
                    }
                    else {
                        p.ahead = 'right'
                    }
                }
            }
            ;
            if (p.blood <= 0) {
                this.entity.destroy();
            }
        }
    });
    Q.component("skill", {
        added: function () {
            this.entity.p.ahead = 'left';
            this.entity.p.type = Q.SPRITE_ENEMY;
            this.entity.p.rangeA = this.entity.p.x;
            this.entity.p.gravity = 0;
            this.entity.p.rangeB = this.entity.p.x + this.entity.p.range;
            this.entity.on("step", this, "step");
            this.entity.on("bump.left,bump.right", function (collision) {
                if (collision.obj.isA("player") || collision.obj.isA("dragon")) {
                    collision.obj.p.blood -= 1;
                }
            });
            this.entity.add("animation,2d");
            this.entity.on("walkLeft", this, "walkLeft");
            this.entity.on("walkRight", this, "walkRight");
        },
        walkLeft: function () {
            this.entity.play("walkLeft")
        },
        walkRight: function () {
            this.entity.play("walkRight")
        },
        step: function () {
            var p = this.entity.p;
            if (p.range != 0) {
                if (p.ahead == 'right') {
                    if (p.x < p.rangeB) {
                        p.x += 1;
                        this.entity.trigger("walkRight");
                    }
                    else {
                        p.ahead = 'left'
                    }
                } else {
                    if (p.x > p.rangeA && p.ahead == 'left') {
                        p.x -= 1;
                        this.entity.trigger("walkLeft");
                    }
                    else {
                        p.ahead = 'right'
                    }
                }
            }
        }
    });
    Q.component("immovables", {
        added: function () {
            this.entity.p.type = Q.SPRITE_NONE;
        }
    });

    //人物NPC
    Q.Sprite.extend("player", {
        init: function (p) {
            this._super(p, {
                sheet: "player",
                sprite: "npc",
                x: 60,
                y: 400,
                ahead: 'right',
                weapon: null,
                equipment: 0,
                gravity: 0,
                speakTo: 0,
                blood: 1,
                level: 1
            });
            Q.input.on("left", this, "walkLeft");
            Q.input.on("right", this, "walkRight");
            Q.input.on("fire", this, "useWeapon");
            Q.input.on("action", this, "action");

            this.on("walkLeft", "walkLeft");
            this.on("walkRight", "walkRight");
            this.on("bump.left,bump.right", function (collision) {
                if (collision.obj.isA("weaponDagger")) {
                    collision.obj.destroy();
                    this.p.equipment += 1;
                    this.p.weapon = new Q.weaponDagger();
                }
                if (collision.obj.isA("weaponVanish")) {
                    collision.obj.destroy();
                    this.p.equipment += 1;
                    this.p.weapon = new Q.weaponVanish();
                }
            });
            this.add("animation,2d, platformerControls");
        },
        action: function () {
            var villager = Q(".npc", 0);
            var b = villager.at(0).p.x;
            for (var i = 0; villager.at(i); i++) {
                if (villager.at(i).p.x < this.p.x + 20 && villager.at(i).p.x > this.p.x - 20) {
                    this.p.speakTo = i;
                    Q.stageScene("taking", 1);
                    Q.stage(0).pause();
                }
            }
        },
        walkLeft: function () {
            this.p.ahead = 'left';
            this.play("walkLeft");
        },
        walkRight: function () {
            this.p.ahead = 'right';
            this.play("walkRight");
        },
        useWeapon: function () {
            if (this.p.equipment > 0) {
                this.p.weapon.trigger("fire", this.p.x);
                this.p.equipment -= 1;
                this.stage.insert(this.p.weapon);
            }
        },
        step: function () {
            if (this.p.blood <= 0) {
                this.stage.pause();
                Q.stageScene("endGame", 1);
            }
            if (this.p.vx != 0) {
                switch (this.p.ahead) {
                    case 'left':
                        this.trigger("walkLeft");
                        break;
                    case 'right':
                        this.trigger("walkRight");
                }
            }
        }
    });
    Q.Sprite.extend("Lily", {
        init: function (p) {
            this._super(p, {
                x: 300,
                sheet: "lily",
                range: 200,
                wordA: 1,
                wordB: 3,
                say1: "莉莉:\n我的名字是莉莉\n英文名是lily。",
                say2: "莉莉:\n我的前边有个怪人，\n挡住了我回家的路，\n我好害怕。",
                say3: "莉莉:\n你能用前边的匕首打败他么？",
                say4: "莉莉:\n去呀，你站着干嘛？",
                say5: "莉莉:\n太好了，你真厉害，\n我现在可以放心回家了！",
                say6: "莉莉:\n天气真好，救命恩人。"
            });
            this.add("npc");
            this.on("markOff", "markOff");
        },
        markOff: function () {
            this.p.mark.destroy();
            this.p.mark = new Q.markOff();
            this.p.mark.p.x = this.p.x;
            this.stage.insert(this.p.mark);
            this.p.state = 2;
        },
        step: function () {
            if (this.p.state == 0) {
                this.p.wordA = 3;
                this.p.wordB = 4;
                this.trigger("markOff");
            }
            if (this.p.state == 2) {
                this.p.mark.p.x = this.p.x;
            }
            if (this.p.state == 3) {
                this.p.mark.destroy();
                this.p.range = 0;
                this.p.wordA = 4;
                this.p.wordB = 5;
                if (this.p.x < 2400) {
                    this.p.ahead = 'right';
                    this.p.x += 1;
                    this.trigger("walkRight");
                } else {
                    this.p.state = 4;
                    this.p.rangeA = 2400;
                    this.p.rangeB = 2600;
                    this.p.range = 200;
                    this.p.wordA = 4;
                    this.p.wordB = 5;
                }
            }
            if (this.p.state == 4) {
                this.p.wordA = 5;
                this.p.wordB = 6;
            }
        }
    });
    Q.Sprite.extend("hong", {
        init: function (p) {
            this._super(p, {
                x: 2700,
                sheet: "hong",
                range: 200,
                wordA: 1,
                wordB: 3,
                say1: "小红:\n你好，我叫小红，\n我经常到深山里采蘑菇哦。",
                say2:"小红:\n我讨厌大灰狼",
                say3: "小红:\n我的奶奶在我很小的时候被大灰狼吃掉了。"
            });
            this.add("npc");
        }
    });
    Q.Sprite.extend("hula", {
        init: function (p) {
            this._super(p, {
                x: 3100,
                sheet: "hula",
                range: 0,
                wordA: 1,
                wordB: 7,
                say1: "村长胡拉:\n我可是这个村的村长。",
                say2: "村长胡拉:\n你知道村子东边的恶龙么？？\n它每个月都会来我们河霸村征收钱财和少女！",
                say3: "村长胡拉:\n那头恶龙可厉害了，\n而且画风和我们也不一样。",
                say4: "村长胡拉:\n再过几天它就会来带走小红。\n小红也是个可怜的娃。",
                say5: "村长胡拉:\n在她小的时候就失去了她最亲近的奶奶，\n从此无依无靠。",
                say6: "村长胡拉:\n我们每年都会派一个战士去讨伐恶龙。\n但没有一个人回来过！",
                say7: "村长胡拉:\n看你骨骼精奇，\n不知你可不可以去东边讨伐巨龙？",
                say8: "村长胡拉:\n去呀，楞着干嘛？？就在前边。"
            });
            this.add("npc");
            this.on("markOff", "markOff");
        },
        markOff: function () {
            this.p.mark.destroy();
            this.p.mark = new Q.markOff();
            this.p.mark.p.x = this.p.x;
            this.stage.insert(this.p.mark);
            this.p.state = 2;
        },
        step: function () {
            if (this.p.state == 0) {
                this.p.wordA = 7;
                this.p.wordB = 8;
                this.trigger("markOff");
            }
            if (this.p.state == 2) {
                this.p.mark.p.x = this.p.x;
            }
            if (Q("player", 0).first().p.blood == 0 && Q("player", 0).first().p.level == 2) {
                Q.clearStages();
                Q.stageScene("godSecret", 0);
            }
        }
    });
    Q.Sprite.extend("lufaxia", {
        init: function (p) {
            this._super(p, {
                x: 2500,
                sheet: "lufaxia",
                range: 1000,
                wordA: 1,
                wordB: 3,
                say1: "绿发侠:\n为什么我的头发那么绿？",
                say2: "绿发侠:\n我总有一天会成为村子了的英雄。",
                say3: "绿发侠:\n你知道么？村子的东边有一只恶龙。\n总有一天我会打败它的，但不是现在。"
            });
            this.add("npc");
        }
    });
    Q.Sprite.extend("lusister", {
        init: function (p) {
            this._super(p, {
                x: 3800,
                sheet: "lusister",
                range: 300,
                wordA: 1,
                wordB: 4,
                say1: "非主流一姐:\n没错，我就是带刺的玫瑰！",
                say2: "非主流一姐:\n我那不争气的弟弟老是在村子里走来走去。\n",
                say3: "非主流一姐:\n他整体嚷嚷着要击败恶龙，\n成为英雄。",
                say4: "非主流一姐:\n但他连一只鹅都打不过。"
            });
            this.add("npc");
        }
    });
    Q.Sprite.extend("god", {
        init: function (p, x, range) {
            this._super(p, {
                x: x,
                sheet: "god",
                range: range,
                wordA: 1,
                wordB: 2,
                say1: "半神：\n我知晓一切。",
                say2: "半神：\n去问另一个我吧，他会告诉你一切的。",
                say3: "半神：\n你并没有死亡，我在深渊凝视着你，\n并把你带到了我的领域里",
                say4: "半神：\n我会告诉你，打败恶龙的方法。\n做为交换，\n你要为我奉上恶龙一半的财富。",
                say5: "半神：\n你居然同意了另一个我的要求，\n好吧，我会告诉你关于恶龙的一切。",
                say6: "半神：\n其实恶龙死亡过很多次，\n但不知怎么回事，他总能够不断地复活。\n我只具备打败他的知识，\n并不知道如何阻止他复活。",
                say7: "半神：\n你已经不能反悔了，\n我会给你一把破风剑,\n这能够使他的飓风消散。\n",
                say8: "半神：\n他居然把破风剑给你了,\n我还曾经求过他多次都不肯给我呢。",
                say9: "半神：\n恶龙失去了飓风，\n必然会使用烈焰。",
                say10: "半神：\n破风剑能够吸收飓风，\n你可以在破风剑吸收了飓风后使用飓风的能力，\n飓风能够吹熄火焰！",
                say11: "半神：\n我扭曲了前方的空间，\n去吧，记得我们的契约！"
            });
            this.add("npc");
            this.on("markOff", "markOff");
        },
        step: function () {
            switch (this.p.state) {
                case 0:
                    this.p.wordA = 1;
                    this.p.wordB = 2;
                    break;
                case 2:
                    this.p.mark.destroy();
                    this.p.mark = new Q.markOff('', this.p.x);
                    Q.stage(0).insert(this.p.mark);
                    this.p.state = 3;
                    break;
                case 3:
                    this.p.wordA = 2;
                    this.p.wordB = 4;
                    break;
                case 4:
                    this.p.wordA = 4;
                    this.p.wordB = 7;
                    break;
                case 5:
                    this.p.wordA = 7;
                    this.p.wordB = 11;
                    break;
                case 6:
                    this.p.wordA = 10;
                    this.p.wordB = 11;
            }
        }
    });

    //监听器
    Q.Sprite.extend("godWatch", {
        init: function (p) {
            this._super(p, {
                god1: Q("god", 0).first(),
                god2: Q("god", 0).at(1),
                god3: Q("god", 0).at(2),
                count: 0
            })
        },
        step: function () {
            if (!Q("dragon", 0).first()) {
                Q.clearStages();
                Q.stageScene("EndingShow", 0);
            }
            if (Q("UI.Container", 0).at(1)) {
                if (Q("UI.Container", 0).at(1).p.opacity > 0.1) {Q("UI.Container", 0).at(1).p.opacity -= 0.01}
                else {Q("UI.Container", 0).at(1).destroy()}
            }
            if (this.p.god1.p.state == 0 && this.p.count == 0) {
                this.p.god2.p.state = 4;
                this.p.count++
            }
            if (this.p.god2.p.state == 0 && this.p.god1.p.state == 0 && this.p.count == 1) {
                this.p.god3.p.state = 5;
                this.p.count++
            }
            if (this.p.god3.p.state == 0 && this.p.god2.p.state == 0 && this.p.god1.p.state == 0 && this.p.count == 2) {
                this.p.god1.p.state = 6;
                this.p.god2.p.state = 6;
                this.p.god3.p.state = 6;
                Q("player", 0).first().p.equipment++;
                Q("player", 0).first().p.weapon = new Q.weaponVanish();
            }
        }
    });

    //敌人
    Q.Sprite.extend("Dave", {
        init: function (p, x) {
            this._super(p, {
                y: 400,
                x: x,
                range: 300,
                sheet: "dave",
                sprite: 'npc',
                blood: 1
            });
            this.add("enemy");
        },
        step: function () {
            if (this.p.blood <= 0) {
                Q("Lily", 0).first().p.state = 3;
            }
        }
    });
    Q.Sprite.extend("dragon", {
        init: function (p, x) {
            this._super(p, {
                sheet: "dragon",
                sprite: "dragon",
                range: 0,
                blood: 1,
                x: x,
                y: 300,
                state: 1,
                wordA: 1,
                wordB: 3,
                say1: "恶龙：\n我即是深渊。",
                say2: "恶龙：\n小鬼，你是来讨伐我的勇士么？",
                say3: "恶龙：\n过来吧\n你回去的路已经长满了荆棘\n你已经回不去了。\n",
                say4: "恶龙：\n你居然没死？。",
                say5: "恶龙：\n无所谓啦，那我就再杀你一次。",
                say6: "恶龙：\n来吧。\n不管多少次都一样。",
                wind: new Q.dragonWind(),
                fire: new Q.dragonFire(),
                level: 1
            });
            this.on("makeWind", "makeWind");
            this.on("makeFire", "makeFire");
            this.on("flyUp", "flyUp");
            this.on("flyDown", "flyDown");
            this.add("animation,enemy");
        },
        makeWind: function () {
            this.trigger("flyUp");
            this.play("DragonWindAKT", 1);
            this.p.wind.p.x = this.p.x - 250;
            this.stage.insert(this.p.wind);
        },
        makeFire: function () {
            this.trigger("flyUp");
            this.play("DragonFireAKT", 1);
            this.p.fire.p.x = this.p.x - 250;
            this.stage.insert(this.p.fire);
        },
        flyUp: function () {
            this.p.ahead = 'up';
        },
        flyDown: function () {
            this.p.ahead = 'down';
        },
        step: function () {
            this.play("DragonFly");
            if (this.p.ahead != 'left') {
                switch (this.p.ahead) {
                    case 'up':
                        if (this.p.y > 40) {
                            this.p.y -= 10;
                        }
                        break;
                    case 'down':
                        if (this.p.y < 300)
                            this.p.y += 10;
                        break;
                }
            }
            switch (this.p.state) {
                case 0:
                    break;
                case 1:
                    if (Q("player", 0).first().p.x > this.p.x - 700) {
                        Q("player", 0).first().p.level = 2;
                        this.stage.insert(new Q.floower('', this.p.x - 920));
                        Q.stage(0).pause();
                        Q.stageScene("dragonSpeak", 1);
                        this.stage.unfollow();
                        this.stage.moveTo(this.p.x - 900, 0);
                    }
                    break;
                case 2:
                    this.trigger("makeWind");
                    this.p.state = 0;
                    break;
                case 3:
                    this.trigger("makeFire");
                    this.p.state = 0;
                    break;
            }
        }
    });

    Q.Sprite.extend("dragonWind", {
        init: function (p) {
            this._super(p, {
                sheet: "dragon",
                sprite: "dragon",
                ahead: 'left',
                range: 0,
                x: 0,
                y: 320
            });
            this.on("fire", "fireweapon");
            this.on("windStop", "windStop");
            this.on("bump.left,bump.right", function (collision) {
                if (collision.obj.isA("weaponDagger")) {
                    collision.obj.destroy();
                }
                if (collision.obj.isA("dragon")) {
                    collision.obj.p.blood--;
                }
            });
            this.add("animation,skill");
        },
        fireweapon: function () {
            this.p.ahead = Q("player", 0).first().p.ahead;
            if (this.p.ahead == 'left') {
                this.p.x = Q("player", 0).first().p.x - 260;
            } else {
                this.p.x = Q("player", 0).first().p.x + 260;
            }

        },
        windStop: function () {
            this.destroy();
        },
        step: function () {
            this.play("Wind");
            if (this.p.ahead == 'left') {
                this.p.x -= 1
            }
            else {
                this.p.x += 1
            }
        }
    });
    Q.Sprite.extend("dragonFire", {
        init: function (p) {
            this._super(p, {
                sheet: "dragon",
                sprite: "dragon",
                range: 0,
                x: 0,
                y: 320
            });
            this.on("fireStop", "fireStop");
            this.on("bump.left,bump.right", function (collision) {
                if (collision.obj.isA("dragonWind")) {
                    this.destroy();
                }
                if (collision.obj.isA("weaponDagger")) {
                    collision.obj.destroy();
                }
            });
            this.add("animation,skill");
        },
        fireStop: function () {
            this.destroy();
        },
        step: function () {
            this.play("Fire");
            this.p.x -= 1;
        }
    });

    //物品
    Q.Sprite.extend("weaponDagger", {
        init: function (p, x) {
            this._super(p, {
                sheet: "dagger",
                sprite: "dagger",
                x: x,
                y: 400,
                gravity: 0,
                ahead: 'right',
                fire: 'off'
            });
            this.on("bump.left,bump.right", function (collision) {
                if (collision.obj.p.type == Q.SPRITE_ENEMY) {
                    collision.obj.p.blood -= 1;
                }
            });
            this.on("fire", "fireweapon");
            this.on("stop", "stop");
            this.add("animation,2d");
        },
        fireweapon: function (x) {
            this.p.ahead = Q("player", 0).first().p.ahead;
            this.p.fire = 'on';
            if (this.p.ahead == 'left') {
                this.p.x = x - 40;
                this.play("DaggerL");
            } else {
                this.p.x = x + 40;
                this.play("DaggerR");
            }
        },
        stop: function () {
            this.p.fire = 'off';
        },
        step: function () {
            if (this.p.fire == 'on') {
                if (this.p.ahead == 'right') {
                    this.p.x += 4;
                } else {
                    this.p.x -= 4;
                }
            }
        }
    });
    Q.Sprite.extend("weaponVanish", {
        init: function (p, x) {
            this._super(p, {
                sheet: "vanish",
                sprite: "vanish",
                x: x,
                y: 400,
                gravity: 0,
                ahead: 'right',
                fire: 'off'
            });
            this.on("bump.left,bump.right", function (collision) {
                if (collision.obj.p.type == Q.SPRITE_ENEMY) {
                    collision.obj.p.blood -= 1;
                    this.destroy();
                }
                if (collision.obj.isA("dragonWind")) {
                    collision.obj.destroy();
                    this.destroy();
                    Q("player", 0).first().p.equipment++;
                    Q("player", 0).first().p.weapon = new Q.dragonWind();
                    Q("dragon", 0).first().p.state = 3;
                    Q("player", 0).first().p.weapon.p.type = Q.SPRITE_DEFAULT;
                }
            });
            this.on("fire", "fireweapon");
            this.on("stop", "stop");
            this.add("animation,2d");
        },
        fireweapon: function (x) {
            this.p.ahead = Q("player", 0).first().p.ahead;
            this.p.fire = 'on';
            if (this.p.ahead == 'left') {
                this.p.x = x - 80;
                this.play("vanishL");
            } else {
                this.p.x = x + 80;
                this.play("vanishR");
            }
        },
        stop: function () {
            this.p.fire = 'off';
        },
        step: function () {
            if (this.p.fire == 'on') {
                if (this.p.ahead == 'right') {
                    this.p.x += 4;
                } else {
                    this.p.x -= 4;
                }
            }
        }
    });
    Q.Sprite.extend("lilyHouse", {
        init: function (p, x) {
            this._super(p, {
                asset: "lilyHouse.png",
                x: x,
                y: 290
            });
            this.add("immovables");
        }
    });
    Q.Sprite.extend("lufaHouse", {
        init: function (p, x) {
            this._super(p, {
                asset: "lufaHouse.png",
                x: x,
                y: 290
            });
            this.add("immovables");
        }
    });
    Q.Sprite.extend("redHouse", {
        init: function (p, x) {
            this._super(p, {
                asset: "redHouse.png",
                x: x,
                y: 290
            });
            this.add("immovables");
        }
    });
    Q.Sprite.extend("greenHouse", {
        init: function (p, x) {
            this._super(p, {
                asset: "greenHouse.png",
                x: x,
                y: 230
            });
            this.add("immovables");
        }
    });
    Q.Sprite.extend("fence", {
        init: function (p, x) {
            this._super(p, {
                x: x,
                asset: "fence.png",
                y: 400
            });
            this.add("immovables");
        }
    });
    Q.Sprite.extend("fenceBroken", {
        init: function (p, x) {
            this._super(p, {
                x: x,
                asset: "fenceBroken.png",
                y: 400
            });
            this.add("immovables");
        }
    });
    Q.Sprite.extend("floower", {
        init: function (p, x) {
            this._super(p, {
                x: x,
                asset: "floower.png",
                y: 400,
                type: Q.SPRITE_DEFAULT
            })
        }
    });
    Q.Sprite.extend("plantBlue", {
        init: function (p, x) {
            this._super(p, {
                x: x,
                asset: "plantBlue_4.png",
                y: 400
            });
            this.add("immovables");
        }
    });
    Q.Sprite.extend("plantGreen1", {
        init: function (p, x) {
            this._super(p, {
                x: x,
                asset: "plantGreen_4.png",
                y: 400
            });
            this.add("immovables");
        }
    });
    Q.Sprite.extend("plantGreen2", {
        init: function (p, x) {
            this._super(p, {
                x: x,
                asset: "plantGreen_5.png",
                y: 400
            });
            this.add("immovables");
        }
    });
    Q.Sprite.extend("plantRed1", {
        init: function (p, x) {
            this._super(p, {
                x: x,
                asset: "plantRed_4.png",
                y: 400
            });
            this.add("immovables");
        }
    });
    Q.Sprite.extend("plantRed2", {
        init: function (p, x) {
            this._super(p, {
                x: x,
                asset: "plantRed_6.png",
                y: 400
            });
            this.add("immovables");
        }
    });
    Q.Sprite.extend("signArrow_right", {
        init: function (p, x) {
            this._super(p, {
                x: x,
                asset: "signArrow_right.png",
                y: 400
            });
            this.add("immovables");
        }
    });
    Q.Sprite.extend("signLarge", {
        init: function (p, x) {
            this._super(p, {
                x: x,
                asset: "signLarge.png",
                y: 400
            });
            this.add("immovables");
        }
    });
    Q.Sprite.extend("markOn", {
        init: function (p) {
            this._super(p, {
                x: 0,
                asset: "markOn.png",
                y: 352
            });
            this.add("immovables");
        }
    });
    Q.Sprite.extend("markOff", {
        init: function (p) {
            this._super(p, {
                x: 0,
                asset: "markOff.png",
                y: 352
            });
            this.add("immovables");
        }
    });
    Q.Sprite.extend("backgroud", {
        init: function (p, x) {
            this._super(p, {
                x: x,
                asset: "background.png",
                y: 300
            });
            this.add("immovables");
        }
    });

    Q.Sprite.extend("show", {
        init: function (p) {
            this._super(p, {
                asset: "show1.png",
                x: 500,
                y: 300,
                state: 1
            })
        },
        step: function () {
            if (Q("UI.Container", 0).at(1)) {
                if (Q("UI.Container", 0).at(1).p.opacity > 0.1)
                    Q("UI.Container", 0).at(1).p.opacity -= 0.01;
            }
        }
    });
    Q.Sprite.extend("man", {
        init: function (p) {
            this._super(p, {
                asset: "man.png",
                x: 300,
                y: 400
            })
        },
        step: function () {
            if (this.p.x < 400) {
                this.p.x += 0.1;
            }
        }
    });


    //动画
    Q.animations('npc', {
        walkRight: {frames: [8, 9, 10, 11], rate: 1 / 4, next: 'standR'},
        walkLeft: {frames: [4, 5, 6, 7], rate: 1 / 4, next: 'standL'},
        standR: {frames: [8], rate: 1, loop: false},
        standL: {frames: [4], rate: 1, loop: false}
    });
    Q.animations('dagger', {
        DaggerR: {frames: [0, 1, 2, 3, 3, 3, 3, 3], rate: 1 / 16, loop: false, trigger: "stop"},
        DaggerL: {frames: [9, 8, 7, 6, 6, 6, 6, 6], rate: 1 / 16, loop: false, trigger: "stop"}
    });
    Q.animations('vanish', {
        vanishR: {frames: [5, 6, 7, 8, 9, 5, 6, 7, 8, 9, 5, 6, 7, 8, 9], rate: 1 / 8, loop: false, trigger: "stop"},
        vanishL: {
            frames: [14, 13, 12, 11, 10, 14, 13, 12, 11, 10, 14, 13, 12, 11, 10],
            rate: 1 / 8,
            loop: false,
            trigger: "stop"
        }
    });
    Q.animations('dragon', {
        DragonFly: {frames: [0, 1, 2, 3], rate: 1 / 6},
        DragonWindAKT: {frames: [4, 5, 6, 7, 4, 5, 6, 7, 4, 5], rate: 1 / 8, loop: false, trigger: "flyDown"},
        DragonFireAKT: {frames: [8, 9, 10, 11, 11, 11, 11, 11, 11, 11], rate: 1 / 8, loop: false, trigger: "flyDown"},
        Wind: {frames: [12, 13, 14, 13, 14, 13, 14, 15], rate: 1 / 6},
        Fire: {frames: [16, 17, 18, 17, 18, 17, 18, 19], rate: 1 / 6},
    });

    //舞台
    Q.scene("game", function (stage) {
        //底层背景
        stage.insert(new Q.Repeater({
            asset: "background.png",
            repeatY: false,
            speedX: 1.0,
            y: 0
        }));
        stage.insert(new Q.signArrow_right("", -200));
        stage.insert(new Q.floower("", -80));
        stage.insert(new Q.signArrow_right("", 700));
        stage.insert(new Q.plantGreen1("", 1200));
        stage.insert(new Q.fence("", 1480));
        stage.insert(new Q.lilyHouse("", 2500));//村子
        stage.insert(new Q.redHouse("", 2800));
        stage.insert(new Q.greenHouse("", 3100));
        stage.insert(new Q.fence("", 3600));
        stage.insert(new Q.signLarge("", 4100));
        stage.insert(new Q.fenceBroken("", 4300));
        stage.insert(new Q.fence("", 4600));//村外
        stage.insert(new Q.plantRed2('', 4900));
        stage.insert(new Q.plantGreen2('', 5600));
        stage.insert(new Q.plantBlue('', 5800));
        stage.insert(new Q.plantRed1('', 6200));
        stage.insert(new Q.signLarge('', 6600));
        stage.insert(new Q.fenceBroken('', 6800));
        stage.insert(new Q.plantRed2('', 7100));


        //匕首
        var dagger = stage.insert(new Q.weaponDagger('', 800));

        //人物
        var player = stage.insert(new Q.player());
        var lily = stage.insert(new Q.Lily());
        var dave = stage.insert(new Q.Dave('', 900));
        var hong = stage.insert(new Q.hong());
        var hula = stage.insert(new Q.hula());
        var lufaxia = stage.insert(new Q.lufaxia());
        var lusister = stage.insert(new Q.lusister());
        var dave = stage.insert(new Q.Dave('', 5600));

        var dragon = stage.insert(new Q.dragon('', 7200));

        //外层背景
        stage.insert(new Q.fence("", 260));
        stage.insert(new Q.plantRed2("", 1600));
        stage.insert(new Q.plantGreen2("", 2000));
        stage.insert(new Q.fence("", 2480));//村子
        stage.insert(new Q.signArrow_right("", 3300));
        stage.insert(new Q.lufaHouse("", 3900));
        stage.insert(new Q.plantBlue('', 4700));
        stage.insert(new Q.plantGreen1('', 5500));
        stage.insert(new Q.signArrow_right('', 6000));
        stage.insert(new Q.fenceBroken('', 6400));

        //摄像机
        var viewport = stage.add("viewport").follow(player, {x: true, y: false});
        //stage.viewport.scale=1.0;
    });
    Q.scene("taking", function (stage) {
        var backgroud = stage.insert(new Q.UI.Container({
            fill: "#000000",
            w: 9000,
            h: 9000,
            y: 0,
            x: 0,
            opacity: 0.8
        }));
        var endBtn = stage.insert(new Q.UI.Button({
            x: 200,
            y: 500,
            w: 150,
            label: "再见",
            fill: "#DD4E54"
        }), backgroud);
        var nextBtn = stage.insert(new Q.UI.Button({
            x: 400,
            y: 500,
            w: 150,
            label: "然后勒？",
            fill: "#2185D5"
        }));
        var villager = Q(".npc", 0).at(Q("player", 0).first().p.speakTo);
        var words = stage.insert(new Q.UI.Text({
            label: villager.p.say1,
            color: "#45B9C4",
            x: 300,
            y: 100,
            w: 600
        }), backgroud);
        var wordA = villager.p.wordA;
        var wordB = villager.p.wordB;
        endBtn.on("click", function () {
            Q.clearStage(1);
            Q.stage().unpause(0);
        });
        nextBtn.on("click", function () {
            var i = wordA;
            if (nextBtn.p.label != "好吧") {
                if (i < wordB) {
                    switch (i) {
                        case 0:
                            words.p.label = villager.p.say1;
                            wordA++;
                            break;
                        case 1:
                            words.p.label = villager.p.say2;
                            wordA++;
                            break;
                        case 2:
                            words.p.label = villager.p.say3;
                            wordA++;
                            break;
                        case 3:
                            words.p.label = villager.p.say4;
                            wordA++;
                            break;
                        case 4:
                            words.p.label = villager.p.say5;
                            wordA++;
                            break;
                        case 5:
                            words.p.label = villager.p.say6;
                            wordA++;
                            break;
                        case 6:
                            words.p.label = villager.p.say7;
                            wordA++;
                            break;
                        case 7:
                            words.p.label = villager.p.say8;
                            wordA++;
                            break;
                        case 8:
                            words.p.label = villager.p.say9;
                            wordA++;
                            break;
                        case 9:
                            words.p.label = villager.p.say10;
                            wordA++;
                            break;
                        case 10:
                            words.p.label = villager.p.say11;
                            wordA++;
                            break;
                    }
                } else {
                    nextBtn.p.label = "好吧";
                }
            } else {
                Q.clearStage(1);
                Q.stage().unpause(0);
                if (villager.p.state == 1) {
                    villager.p.state = 0;
                } else {
                    if (villager.isA("god")) {
                        villager.p.state = 0;
                    }
                }
            }

        })
    });
    Q.scene("dragonSpeak", function (stage) {
        var backgroud = stage.insert(new Q.UI.Container({
            fill: "#000000",
            w: 9000,
            h: 9000,
            y: 0,
            x: 0,
            opacity: 0.8
        }));
        var nextBtn = stage.insert(new Q.UI.Button({
            x: 400,
            y: 500,
            w: 150,
            label: "然后勒？",
            fill: "#2185D5"
        }));
        var dragon = Q("dragon", 0).first();
        var words = stage.insert(new Q.UI.Text({
            label: dragon.p.say1,
            color: "#45B9C4",
            x: 300,
            y: 100,
            w: 600
        }), backgroud);
        switch (dragon.p.level) {
            case 1:
                var wordA = 1;
                var wordB = 3;
                break;
            case 2:
                var wordA = 3;
                var wordB = 6;
                break;
        }

        nextBtn.on("click", function () {
            var i = wordA;
            if (nextBtn.p.label != "好吧") {
                if (i < wordB) {
                    switch (i) {
                        case 0:
                            words.p.label = dragon.p.say1;
                            wordA++;
                            break;
                        case 1:
                            words.p.label = dragon.p.say2;
                            wordA++;
                            break;
                        case 2:
                            words.p.label = dragon.p.say3;
                            wordA++;
                            break;
                        case 3:
                            words.p.label = dragon.p.say4;
                            wordA++;
                            break;
                        case 4:
                            words.p.label = dragon.p.say5;
                            wordA++;
                            break;
                        case 5:
                            words.p.label = dragon.p.say6;
                            wordA++;
                            break;
                        case 6:
                            words.p.label = dragon.p.say7;
                            wordA++;
                            break;
                        case 7:
                            words.p.label = dragon.p.say8;
                            wordA++;
                            break;
                        case 8:
                            words.p.label = dragon.p.say9;
                            wordA++;
                            break;
                        case 9:
                            words.p.label = dragon.p.say10;
                            wordA++;
                            break;
                    }
                } else {
                    nextBtn.p.label = "好吧";
                }
            } else {
                Q.clearStage(1);
                Q.stage().unpause(0);
                if (dragon.p.state == 1) {
                    dragon.p.state = 2;
                }
            }

        })
    });
    Q.scene("endGame", function (stage) {
        var backgroud = stage.insert(new Q.UI.Container({
            fill: "#000000",
            w: Q.width * 2,
            h: document.body.clientHeight * 2,
            y: 0,
            x: 0,
            opacity: 0.8
        }));
        var endBtn = stage.insert(new Q.UI.Button({
            x: Q.width / 2,
            y: document.body.clientHeight / 2,
            w: 200,
            h: 100,
            label: "涅盘",
            fill: "#DD4E54"
        }));
        endBtn.on("click", function () {
            if (Q("player", 0).first().p.level == 1) {
                Q.clearStages();
                Q.stageScene("game", 0);
            } else {
                Q.clearStages();
                Q.stageScene("godSecret", 0);
            }

        })
    });
    Q.scene("godSecret", function (stage) {
        stage.insert(new Q.UI.Container({
            fill: "#000000",
            w: 9000,
            h: 9000,
            y: 0,
            x: 0
        }));
        stage.insert(new Q.Repeater({
            asset: "background-floor.png",
            repeatY: false,
            speedX: 1.0,
            y: 210
        }));

        var warp=stage.insert(new Q.backgroud('', 1800));
        warp.p.asset="backgroundWarp.png";
        stage.insert(new Q.backgroud('', 2717));
        stage.insert(new Q.backgroud('', 3634));
        stage.insert(new Q.backgroud('', 4551));

        //内层
        stage.insert(new Q.floower('', -300));
        stage.insert(new Q.signArrow_right('', 1000));
        stage.insert(new Q.plantRed1('', 2200));
        stage.insert(new Q.signArrow_right('',2800));

        var player = stage.insert(new Q.player());
        var god1 = stage.insert(new Q.god('', 0, 0));
        var god2 = stage.insert(new Q.god('', 128, 256));
        var god3 = stage.insert(new Q.god('', 512, 0));
        var dragon = stage.insert(new Q.dragon('', 3600));

        god1.p.state = 3;
        player.p.level = 2;
        dragon.p.level = 2;

        //外层
        stage.insert(new Q.fenceBroken('', 780));
        stage.insert(new Q.plantRed2('', 1200));
        stage.insert(new Q.fenceBroken('', 1780));
        stage.insert(new Q.plantBlue('',2600));
        var curtain = stage.insert(new Q.UI.Container({
            fill: "#000000",
            w: 9000,
            h: 9000,
            y: 0,
            x: 0,
            opacity: 1
        }));

        stage.insert(new Q.godWatch());
        var viewport = stage.add("viewport").follow(player, {x: true, y: false});
    });
    Q.scene("EndingShow", function (stage) {
        stage.insert(new Q.UI.Container({
            fill: "#000000",
            w: 9000,
            h: 9000,
            y: 0,
            x: 0,
            opacity: 1
        }));
        var show = stage.insert(new Q.show());
        var next = stage.insert(new Q.UI.Button({
            x: 200,
            y: 500,
            w: 200,
            label: "next",
            fill: "#2A5465"
        }));
        var text = stage.insert(new Q.UI.Text({
            label: "我杀死了恶龙",
            color: "#BBC8CE",
            x: 800,
            y: 100,
            w: 600,
        }));
        var man = new Q.man();
        var curtain = stage.insert(new Q.UI.Container({
            fill: "#000000",
            w: 9000,
            h: 9000,
            y: 0,
            x: 0,
            opacity: 1
        }));

        next.on("click", function () {
            switch (show.p.state) {
                case 1:
                    show.p.asset = "";
                    text.p.label = "我要进入恶龙的山洞\n找到恶龙的宝藏\n履行我和神明的契约";
                    text.p.x = 300;
                    text.p.y = 200;
                    curtain.p.opacity = 1;
                    show.p.state++;
                    break;
                case 2:
                    show.p.asset = "show2.png";
                    stage.insert(man);
                    stage.insert(next);
                    stage.insert(curtain);
                    text.p.label = "我发现了恶龙的宝藏\n她是那么迷人";
                    text.p.x = 600;
                    text.p.y = 100;
                    curtain.p.opacity = 1;
                    show.p.state++;
                    break;
                case 3:
                    show.p.asset = "";
                    man.destroy();
                    text.p.label = "我被宝藏迷住了\n忘记了和村民的约定\n忘记了和神灵的契约";
                    text.p.x = 300;
                    text.p.y = 200;
                    curtain.p.opacity = 1;
                    show.p.state++;
                    break;
                case 4:
                    show.p.asset = "show3.png";
                    text.p.label = "我长出了獠牙\n皮肤渗出鳞片";
                    text.p.x = 600;
                    text.p.y = 100;
                    curtain.p.opacity = 1;
                    show.p.state++;
                    break;
                case 5:
                    show.p.asset = "";
                    text.p.label = "我明白了恶龙重生的秘密\n勇士已不再";
                    text.p.x = 300;
                    text.p.y = 200;
                    curtain.p.opacity = 1;
                    show.p.state++;
                    break;
                case 6:
                    show.p.asset = "show4.png";
                    text.p.label = "没有人可以带走我的宝藏";
                    text.p.x = 600;
                    text.p.y = 100;
                    curtain.p.opacity = 1;
                    show.p.state++;
                    break;
                case 7:
                    show.p.asset = "";
                    text.p.label = "End";
                    text.p.x = 500;
                    text.p.y = 200;
                    curtain.p.opacity = 1;
                    show.p.state++;
                    next.destroy();
                    break;
            }
        });

    });


    //加载背景
    Q.preload(["background.png", "background-floor.png","backgroundWarp.png"]);
    Q.preload(["show1.png", "show2.png", "show3.png", "show4.png", "man.png"]);
    //加载建筑
    Q.preload(["lilyHouse.png", "redHouse.png", "greenHouse.png", "lufaHouse.png"]);
    //加载杂物
    Q.preload(["dagger.png", "weapon.json", "vanish.json"]);
    Q.preload(["fenceBroken.png", "fence.png", "floower.png", "plantRed_6.png", "plantRed_4.png", "plantGreen_4.png", "plantGreen_5.png", "plantBlue_4.png"]);
    Q.preload(["signArrow_right.png", "signLarge.png", "markOn.png", "markOff.png"]);
    //加载人物
    Q.preload(["NPC/14.png", "player.json"]);
    Q.preload(["NPC/12.png", "lily.json"]);
    Q.preload(["NPC/13.png", "dave.json"]);
    Q.preload(["NPC/15.png", "hong.json"]);
    Q.preload(["NPC/4.png", "hula.json"]);
    Q.preload(["NPC/9.png", "lufaxia.json"]);
    Q.preload(["NPC/6.png", "lusister.json"]);
    Q.preload(["dragon.png", "dragon.json"]);
    Q.preload(["NPC/3.png", "god.json"]);
    //加载游戏
    Q.preload(function () {
        //人物数据
        Q.compileSheets("NPC/14.png", "player.json");
        Q.compileSheets("NPC/12.png", "lily.json");
        Q.compileSheets("NPC/13.png", "dave.json");
        Q.compileSheets("NPC/15.png", "hong.json");
        Q.compileSheets("NPC/4.png", "hula.json");
        Q.compileSheets("NPC/9.png", "lufaxia.json");
        Q.compileSheets("NPC/6.png", "lusister.json");
        Q.compileSheets("dragon.png", "dragon.json");
        Q.compileSheets("NPC/3.png", "god.json");
        //武器数据
        Q.compileSheets("dagger.png", "weapon.json");
        Q.compileSheets("dagger.png", "vanish.json");

        Q.stageScene("game",0);
    }, {
        progressCallback: function (loaded, total) {
            var element = document.getElementById("loading_progress");
            element.style.width = Math.floor(loaded / total * 100) + "%";
            if(Math.floor(loaded / total )==1){
                document.getElementById("loading").style.display="none";
            }
        }
    });
};
