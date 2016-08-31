
View = {
    NOTE_SIZE: Taiko.NOTE_SIZE,

    SCORE_X: 528,
    SCORE_Y: 113,
    SCORE_X2: 528,
    SCORE_Y2: 88,

    COMBO_NUMBER_X: 47,
    COMBO_NUMBER_Y: 150,
    COMBO_NUMBER_INTERVAL: 0,

    COMBO_NUMBER_X2: 47,
    COMBO_NUMBER_Y2: 146,
    COMBO_NUMBER_INTERVAL2: -10,

    MTAIKOFLOWER_X: 3,
    MTAIKOFLOWER_Y: 124,
    MTAIKOFLOWER_DURATION: 30,

    MTAIKO_DURATION: 5,

    MTAIKO_LIX: 2,
    MTAIKO_LIY: 115,

    MTAIKO_LOX: 2,
    MTAIKO_LOY: 115,

    MTAIKO_RIX: 47,
    MTAIKO_RIY: 115,

    MTAIKO_ROX: 47,
    MTAIKO_ROY: 115,

    MTAIKO_SFX: 92,
    MTAIKO_SFY: 149,

    SFIELDBG_X: 0,
    SFIELDBG_Y: 121,

    FUMEN_X: 92,
    FUMEN_Y: 149,

    NOTE_X: 35,

    GOGOSPLASH: 5,
    GOGO_FRAME: 20,
    GOGO_WIDTH: -60,

    FIRE_X: 33,
    FIRE_Y: 87,
    FIRE_FRAME: 8,

    EXPLOSION_UPPER_X: 52,
    EXPLOSION_UPPER_Y: 103,
    EXPLOSION_UPPER_FRAME: 9,

    EXPLOSION_LOWER_X: 87,
    EXPLOSION_LOWER_Y: 138,
    EXPLOSION_LOWER_FRAME: 9,

    JUDGEMENT_X: 100,
    JUDGEMENT_Y: 110,

    GAUGE_X: 200,
    GAUGE_Y: 27,

    NOTE_FLY_DURATION: 20,
    NOTE_FLY_ACC_Y: 0.5,

    ROLL_BALLOON_X: 50,
    ROLL_BALLOON_Y: 0,

    ROLL_BALLOON_NUMBER_DX: 66,
    ROLL_BALLOON_NUMBER_DY: 22,
    ROLL_BALLOON_INTERVAL: -5,
};

View.Animation = Utils.deriveClass(Sprite, function(options) {
    Sprite.call(this);
    this._maxFrame = 1;
    this._frameDuration = this._duration = 1;
    this.frameY = 0;
    this._loop = false;
    if (options) {
        if (options.x) { this.x = options.x; }
        if (options.y) { this.y = options.y; }
        if (options.bitmap) { this.bitmap = ImageManager.toBitmap(options.bitmap); }
        if (options.frame) { this._maxFrame = options.frame; }
        if (options.duration) { this._frameDuration = this._duration = options.duration; }
        if (options.loop) { this._loop = options.loop; }
        if (options.frameY) { this.frameY = options.frameY; }
    }
    this.reset(false);
},
{
    get frameHeight() {
        return this.bitmap.height;
    },

    update() {
        Sprite.prototype.update.call(this);
        if (!this.visible || !this.bitmap) {
            return;
        }
        if (this._duration > 0) {
            --this._duration;
        } else {
            this.setCurrentFrame();
        }
    },

    isLoop() {
        return this._loop;
    },

    reset(toShow) {
        if (toShow === undefined) { toShow = true; }
        this._frameCount = 0;
        this.setCurrentFrame();
        this.visible = toShow;
    },

    setCurrentFrame() {
        var w = this.bitmap.width / this._maxFrame;
        this.setFrame(this._frameCount * w, this.frameY, w, this.frameHeight);
        this._duration = this._frameDuration;
        if (this._loop) {
            if (this._frameCount === this._maxFrame - 1) {
                this._frameCount = 0;
            } else {
                ++this._frameCount;
            }
        } else {
            if (this._frameCount === this._maxFrame) {
                this.visible = false;
            } else {
                ++this._frameCount;
            }
        }
    }
});


View.Digit = Utils.deriveClass(Sprite, function(bitmap) {
    Sprite.call(this, bitmap);
    this.clear();
},
{
    clear() {
        this.visible = false;
    },

    show(num) {
        var w = this.bitmap.width / 10;
        this.setFrame(num * w, 0, w, this.bitmap.height);
        this.visible = true;
    }
});


View.Number = Utils.deriveClass(Sprite, function(options) {
    Sprite.call(this);
    this.interval = 0;
    if (options) {
        if (options.x) { this.x = options.x; }
        if (options.y) { this.y = options.y; }
        if (options.interval) { this.interval = options.interval; }
        if (options.alignment) { this.alignment = options.alignment; }
        if (options.bitmap) { this._digitBitmap = ImageManager.toBitmap(options.bitmap); }
    }
},
{
    clear() {
        this._numNow = null;
        this.children.splice(0);
    },

    show(num) {
        if (num === this._numNow) { return; }
        this._numNow = num;
        this.clear();
        var digitWidth = this._digitBitmap.width / 10 + this.interval;
        num = num.toString();
        var len = num.length;
        var totalWidth = digitWidth * len - this.interval;
        for (var i = 0; i < len; ++i) {
            var ch = num[i];
            var digit = new View.Digit(this._digitBitmap);
            digit.x = digitWidth * i;
            digit.z = this.z;
            switch(this.alignment) {
                case 'center':
                    digit.x -= totalWidth / 2;
                    break;
                case 'right':
                    digit.x -= totalWidth;
                    break;
            }
            digit.show(parseInt(ch));
            this.addChild(digit);
        };

        this.onChange();
    },

    onChange: Utils.voidFunction
});


View.SongList = Utils.deriveClass(Sprite, function() {
    Sprite.call(this, ImageManager.skin('songselectbg'));
    this._songlist = new View.SongList.Songs();
    this.addChild(this._songlist);
});


View.SongList.Songs = Utils.deriveClass(Sprite, function() {
    Sprite.call(this, new Bitmap(Graphics.width, Graphics.height));
    this.bitmap.fontSize = 14;
},
{
    update() {
        if (this._songdata !== Scene.scene.songdata()) { this.refresh(); }
    },

    refresh() {
        this._songdata = Scene.scene.songdata();
        this.bitmap.clear();

        var i;
        for (var i = -3; i <= -1; ++i) {
            this.drawSimpleInfo(Scene.scene.songdata(i),
                60, 105 + i * View.SongList.Songs.LINE_HEIGHT);
        };

        this.drawSimpleInfo(this._songdata, 120, 110);
        this.drawPlaydata(Taiko.Playdata.load(this._songdata.name));

        for (var i = 1; i <= 3; ++i) {
            this.drawSimpleInfo(Scene.scene.songdata(i),
                60, 125 + i * View.SongList.Songs.LINE_HEIGHT);
        }
    },

    drawSimpleInfo(songdata, x, y, width, height) {
        if (!width) { width = 340; }
        if (!height) { height = View.SongList.Songs.LINE_HEIGHT; }
        this.bitmap.drawText(songdata.title, x, y, width, height);
        this.bitmap.drawText("★" + songdata.level, x, y, width, height, "right");
    },

    drawPlaydata(playdata) {
        var crownType;
        if (playdata.isEmpty()) {
            crownType = 0;
        } else if (playdata.miss === 0) {
            crownType = 3;
        } else if (playdata.normalClear) {
            crownType = 2;
        } else {
            crownType = 1;
        }

        var src = ImageManager.skin('clearmark');
        src.addLoadListener(function() {
            this.bitmap.blt(src, 28 * crownType, 0, 28, 28, 65, 115);
            this.bitmap.drawText(playdata.score,
                0, Graphics.height - 14, Graphics.width, 14, 'right');
        }.bind(this));
    }
}, {
    LINE_HEIGHT: 30,
    SCORE_HEIGHT: 15
});


View.Play = Utils.deriveClass(Sprite, function() {
    Sprite.call(this);

    var sfieldbg = new Sprite(ImageManager.skin('sfieldbg'));
    sfieldbg.x = View.SFIELDBG_X;
    sfieldbg.y = View.SFIELDBG_Y;

    // mask
    var sfieldbg2 = new Sprite(ImageManager.skin('sfieldbg'))
    sfieldbg2.x = View.SFIELDBG_X;
    sfieldbg2.y = View.SFIELDBG_Y;
    sfieldbg2.setFrame(0, 0, View.FUMEN_X, Graphics.height);

    var explosions = View.Play.Explosion.create();

    this.addChild(sfieldbg);
    this.addChild(new View.Play.SfieldFlash());
    this.addChild(new View.Play.Gogosplash());
    this.addChild(explosions.lower);
    this.addChild(new View.Play.Fumen());
    this.addChild(sfieldbg2);
    this.addChild(new View.Play.MTaiko());
    this.addChild(new View.Play.Score());
    this.addChild(explosions.upper);
    this.addChild(new View.Play.Judgement());
    this.addChild(new View.Play.Combo());
    this.addChild(new View.Play.Gauge());
    this.addChild(new View.Play.NoteFly());
},
{
    update() {
        Sprite.prototype.update.call(this);
    }
});

View.Play.Fumen = Utils.deriveClass(Sprite, function() {
    Sprite.call(this);
    this._notes = Taiko.fumen.notesForDisplay;
    this.x = View.FUMEN_X + View.NOTE_X;
    this.y = View.FUMEN_Y;
},
{
    update() {
        this.pushNotes();
        while (this.removeInvalid()) {}
        Sprite.prototype.update.call(this);
    },

    removeInvalid() {
        var view = this.children[0];
        if (!view || view.visible) {
            return false;
        }
        return this.removeChildAt(0);
    },

    pushNotes() {
        var note;
        while (true) {
            note = this._notes[0];
            if (!note || note.appearTime > Taiko.playTime) {
                break;
            }
            var view = new View.Play.Fumen.Note(note);
            this.addChild(view);
            this._notes.shift();
        }
        this.children.sort(function(a, b) {
            return a.z - b.z;
        });
    }
});

View.Play.Fumen.Note = Utils.deriveClass(Sprite, function(note) {
    this._note = note;
    Sprite.call(this, ImageManager.note(note));
    this.anchor.x = note.anchorX;
},
{
    isValid() {
        return this._note.isValid() && this.x + this.width > 0;
    },

    update() {
        this.visible = this.isValid();
        if (this.visible) {
            this.x = this._note.x;
            this.z = this._note.z;
        }
    }
});

View.Play.Score = Utils.deriveClass(Sprite, function() {
    Sprite.call(this);
    this._scoreView = new View.Number(
        {x: View.SCORE_X, y: View.SCORE_Y, alignment: 'right', bitmap: 'font_m'});
    this._scoreDiffView = new View.Play.Score.Diff(
        {x: View.SCORE_X2, y: View.SCORE_Y2, alignment: 'right', bitmap: 'font_m_red'});
    this.addChild(this._scoreView);
    this.addChild(this._scoreDiffView);

    this._score = 0;
    this.clearTime = 0;
},
{
    update() {
        --this.clearTime;
        if (this._score !== Taiko.score) {
            var scoreLast = this._score;
            this._score = Taiko.score;
            this._scoreView.show(this._score);
            this._scoreDiffView.show(this._score - scoreLast);
            this._clearTime = 40;
        } else if (this._clearTime < 0) {
            this._scoreDiffView.clear();
        }
        Sprite.prototype.update.call(this);
    }
});

View.Play.Score.Diff = Utils.deriveClass(View.Number, function(options) {
    View.Number.call(this, options);
    this._changeEffect = 0;
},
{
    update() {
        View.Number.prototype.update.call(this);
        if (this._changeEffect) {
            this.children.forEach(function(digit) { digit.x += 2; });
            --this._changeEffect;
        }
    },

    onChange() {
        this._changeEffect = 5;
        this.children.forEach(function(digit) { digit.x -= 10; });
    }
});

View.Play.Judgement = Utils.deriveClass(View.Animation, function() {
    View.Animation.call(this,
        {x: View.JUDGEMENT_X, y: View.JUDGEMENT_Y, duration: 30, bitmap: 'judgement'});
    Taiko.addHitListener(View.Play.Judgement.prototype.resetAndShow.bind(this));
},
{
    get frameHeight() {
        return this.bitmap.height / 3;
    },

    update() {
        View.Animation.prototype.update.call(this);
        if (!this.visible) {
            return;
        }
        if (this._changeEffect > 0) {
            this.y -= 2;
            this._changeEffect -= 2;
        }
    },

    resetAndShow(note) {
        if (!note.isNormal()) {
            return;
        }
        var type;
        switch(note.performance) {
            case Taiko.Judgement.MISS:
                type = 2;
                break;
            case Taiko.Judgement.GREAT:
                type = 1;
                break;
            default:
                type = 0;
                break;
        }
        this.frameY = this.bitmap.height * type / 3;

        this.y = View.JUDGEMENT_Y + 8;
        this._changeEffect = 8;

        this.reset(true);
    }
});


View.Play.Combo = Utils.deriveClass(Sprite, function() {
    Sprite.call(this);

    this._comboNumber = 0;
    this._combo1 = new View.Number({
        x: View.COMBO_NUMBER_X, y: View.COMBO_NUMBER_Y,
        interval: View.COMBO_NUMBER_INTERVAL, alignment: 'center',
        bitmap: 'combonumber'
    });
    this._combo2 = new View.Number({
        x: View.COMBO_NUMBER_X2, y: View.COMBO_NUMBER_Y2,
        interval: View.COMBO_NUMBER_INTERVAL2, alignment: 'center',
        bitmap: 'combonumber_l'
    });
    this._flower = new View.Animation({
        x: View.MTAIKOFLOWER_X, y: View.MTAIKOFLOWER_Y,
        duration: View.MTAIKOFLOWER_DURATION, bitmap: 'mtaikoflower'
    });

    Taiko.addHitListener(View.Play.Combo.prototype.updateCombo.bind(this));

    this.addChild(this._flower);
    this.addChild(this._combo1);
    this.addChild(this._combo2);

    this.visible = false;
},
{
    update() {
        if (this._flower.visible) {
            this._flower.update();
        }
    },

    updateCombo() {
        var combo = Taiko.combo;
        if (combo < 10) {
            this.visible = false;
        } else {
            this.visible = true;
            if (combo % 50 == 0) {
                this._flower.reset();
            }
            if (combo < 50) {
                this._combo1.show(combo);
                this._combo2.clear();
            } else {
                this._combo1.clear();
                this._combo2.show(combo);
            }
        }
    }
});


View.Play.MTaiko = Utils.createClass(Sprite, function() {
    Sprite.call(this);

    var redBitmap = ImageManager.skin('mtaikoflash_red');
    redBitmap.addLoadListener(function() {
        this._li = new View.Animation({
            x: View.MTAIKO_LIX, y: View.MTAIKO_LIY,
            bitmap: this.getBitmap(redBitmap, 0), duration: View.MTAIKO_DURATION
        });
        this._ri = new View.Animation({
            x: View.MTAIKO_RIX, y: View.MTAIKO_RIY,
            bitmap: this.getBitmap(redBitmap, 1), duration: View.MTAIKO_DURATION
        });
        this.addChild(this._li);
        this.addChild(this._ri);
    }.bind(this));

    var blueBitmap = ImageManager.skin('mtaikoflash_blue');
    blueBitmap.addLoadListener(function() {
        this._lo = new View.Animation({
            x: View.MTAIKO_LOX, y: View.MTAIKO_LOY,
            bitmap: this.getBitmap(blueBitmap, 0), duration: View.MTAIKO_DURATION
        });
        this._ro = new View.Animation({
            x: View.MTAIKO_ROX, y: View.MTAIKO_ROY,
            bitmap: this.getBitmap(blueBitmap, 1), duration: View.MTAIKO_DURATION
        });
        this.addChild(this._lo);
        this.addChild(this._ro);
    }.bind(this));
},
{
    update() {
        if (Input.isTriggered('outerL')) { this._lo.reset(); }
        if (Input.isTriggered('outerR')) { this._ro.reset(); }
        if (Input.isTriggered('innerL')) { this._li.reset(); }
        if (Input.isTriggered('innerR')) { this._ri.reset(); }
        Sprite.prototype.update.call(this);
    },

    getBitmap(src, type) {
        var ret = new Bitmap(src.width / 2, src.height);
        ret.blt(src, src.width * type / 2, 0, ret.width, ret.height, 0, 0);
        return ret;
    },
});

View.Play.SfieldFlash = Utils.deriveClass(Sprite, function() {
    Sprite.call(this);
    this._sfr = new View.Animation({
        x: View.MTAIKO_SFX, y: View.MTAIKO_SFY,
        bitmap: ImageManager.skin('sfieldflash_red'), duration: View.MTAIKO_DURATION
    });
    this._sfb = new View.Animation({
        x: View.MTAIKO_SFX, y: View.MTAIKO_SFY,
        bitmap: ImageManager.skin('sfieldflash_blue'), duration: View.MTAIKO_DURATION
    });
    this._sfg = new View.Animation({
        x: View.MTAIKO_SFX, y: View.MTAIKO_SFY,
        bitmap: ImageManager.skin('sfieldflash_gogotime'), duration: View.MTAIKO_DURATION
    });
    this.addChild(this._sfr);
    this.addChild(this._sfb);
    this.addChild(this._sfg);
},
{
    update() {
        if (Taiko.isGogotime()) {
            this._sfg.reset();
        } else {
            this._sfg.visible = false;
            if (Input.isOuterTriggered()) {
                this._sfr.visible = false;
                this._sfb.reset();
            }
            if (Input.isInnerTriggered()) {
                this._sfr.reset();
                this._sfb.visible = false;
            }
        }
        Sprite.prototype.update.call(this);
    }
});

View.Play.Gauge = Utils.deriveClass(Sprite, function() {
    Sprite.call(this);

    var bitmap = ImageManager.skin('normagauge');
    this._empty = new Sprite(bitmap);
    this._full = new Sprite(bitmap);
    this._soul = new Sprite();

    this._empty.move(View.GAUGE_X, View.GAUGE_Y);
    this._full.move(View.GAUGE_X, View.GAUGE_Y);
    this._soul.move(this._empty.x + View.Play.Gauge.WIDTH - 15, View.GAUGE_Y - 40);

    this._empty.anchor.y = this._full.anchor.y = 0.5;

    this._empty.setFrame(0, 0, View.Play.Gauge.WIDTH, View.Play.Gauge.HEIGHT);

    Taiko.addHitListener(function(note) {
        if (note.isNormal()) { this.refresh(); }
    }.bind(this));

    this.addChild(this._empty);
    this.addChild(this._full);
    this.addChild(this._soul);

    this.refresh();
},
{
    update: Utils.voidFunction,
    refresh() {
        var fillW;
        var rate = Taiko.gauge.rate;
        var nRate = Taiko.Gauge.NORMAL_RATE;

        if (rate < nRate) {
            fillW = View.Play.Gauge.NORMAL_X * rate / nRate;
        } else {
            fillW = View.Play.Gauge.WIDTH -
                (1 - rate) *
                (View.Play.Gauge.WIDTH - View.Play.Gauge.NORMAL_X) /
                (1 - nRate);
        }

        var y, src;

        if (Taiko.gauge.isMax()) {
            y = View.Play.Gauge.HEIGHT * 3;
            src = 'soul-2';
        } else {
            y = View.Play.Gauge.HEIGHT;
            src = 'soul-1';
        }

        this._full.setFrame(0, y, fillW, View.Play.Gauge.HEIGHT);
        this._soul.bitmap = ImageManager.skin(src);
    }
},
{
    WIDTH: 300,
    HEIGHT: 22,
    NORMAL_X: 233
});


View.Play.NoteFly = Utils.deriveClass(Sprite, function() {
    Sprite.call(this);
    Taiko.addHitListener(function(note) {
        if (note.performance !== Taiko.Judgement.MISS && !note.isBalloon()) {
            this.addChild(new View.Play.NoteFly.Note(note));
        };
    }.bind(this));
},
{
    update() {
        while (this.removeInvalid()) {}
        Sprite.prototype.update.call(this);
    },

    removeInvalid() {
        var view = this.children[0];
        if (!view || view.visible) {
            return false;
        }
        return this.removeChildAt(0);
    }
},
function() {

    function weightedAverage(x, y, wx, wy) {
        return (x * wx + y * wy) / (wx + wy)
    };

    var d = View.NOTE_FLY_DURATION;
    var x0 = View.FUMEN_X + View.NOTE_X;
    var y0 = View.FUMEN_Y + View.NOTE_SIZE / 2;

    var x1 = View.GAUGE_X + 309;
    var y1 = View.GAUGE_Y;

    var a = View.NOTE_FLY_ACC_Y;

    var xTable = [];
    var yTable = [];

    return {
        getX(t) {
            if (xTable[t] === undefined) {
                xTable[t] = weightedAverage(x0, x1, d - t, t);
            }
            return xTable[t];
        },
        getY(t) {
            if (yTable[t] === undefined) {
                yTable[t] = weightedAverage(y0, y1, d - t, t) - t * (d - t) * a;
            }
            return yTable[t];
        },
    }
}());


View.Play.NoteFly.Note = Utils.deriveClass(Sprite, function(note) {
    Sprite.call(this, ImageManager.noteHead(note.type));
    this.anchor.x = this.anchor.y = 0.5;
    this._t = 0;
    this.update();
},
{
    update() {
        if (this._t < View.NOTE_FLY_DURATION) {
            this.x = View.Play.NoteFly.getX(this._t);
            this.y = View.Play.NoteFly.getY(this._t);
            ++this._t;
        } else {
            this.visible = false;
        }
    }
});

View.Play.Gogosplash = Utils.deriveClass(Sprite, function() {
    Sprite.call(this);

    var fire = new View.Animation({
        x: View.FIRE_X, y: View.FIRE_Y, loop: true,
        frame: View.FIRE_FRAME, duration: 3, bitmap: 'fire'
    });
    fire.visible = true;

    this.addChild(fire);

    var bitmap = ImageManager.skin('gogosplash');
    bitmap.addLoadListener(function() {
        var frameX = bitmap.width / View.GOGO_FRAME;
        var interval = frameX + View.GOGO_WIDTH;
        var total = interval * (View.GOGOSPLASH - 1) + frameX;
        var xOffset = (Graphics.width - total) / 2;
        var y = Graphics.height - bitmap.height;

        for (var i = 0; i < View.GOGOSPLASH; ++i) {
            var view = new View.Animation({
                x: xOffset + interval * i,
                y: y,
                bitmap: bitmap,
                frame: View.GOGO_FRAME
            })
            this.addChild(view);
        };
    }.bind(this));

    this.visible = false;
},
{
    update() {
        var isGogotime = Taiko.isGogotime();
        if (this._gogotime && !isGogotime) {
            this.visible = false;
            this._gogotime = false;
        } else if (!this._gogotime && isGogotime) {
            this.visible = true;
            this._gogotime = true;
            this.children.slice(1).forEach(function(splash) {
                splash.reset();
            });
        }

        if (this.visible) {
            Sprite.prototype.update.call(this);
        }
    }
});


View.Play.Explosion = Utils.deriveClass(View.Animation, null,
{
    get frameHeight() {
        return this.bitmap.height / 4;
    },
    resetAndShow(type) {
        this._duration = 0;
        this.frameY = this.bitmap.height * type / 4;
        this.reset();
    }
},
{
    create() {
        var upper = new View.Play.Explosion({
            x: View.EXPLOSION_UPPER_X, y: View.EXPLOSION_UPPER_Y,
            frame: View.EXPLOSION_UPPER_FRAME, duration: 1,
            bitmap: 'explosion_upper'
        });

        var lower = new View.Play.Explosion({
            x: View.EXPLOSION_LOWER_X, y: View.EXPLOSION_LOWER_Y,
            frame: View.EXPLOSION_LOWER_FRAME, duration: 1,
            bitmap: 'explosion_lower'
        });

        Taiko.addHitListener(function(note) {
            if (note.performance === Taiko.Judgement.MISS || !note.isNormal()) {
                return;
            }
            type = note.performance === Taiko.Judgement.PERFECT ? 0 : 1;
            type += note.isDoubleScore() ? 2 : 0;
            upper.resetAndShow(type);
            lower.resetAndShow(type);
        });

        return {lower: lower, upper: upper};
    },
});
