var requestAnimationFrame = require('./kit').requestAnimationFrame;
var merge = require('./kit').merge;
var CanvasObject = require('./object');

var Engine = function(canvasNode, config){
    if(!canvasNode){throw 'canvasNode not found';}
    this.list = [];

    this.canvas = canvasNode;
    this._status = 0;

    this.fps = 60;
    this.number = 0;

    this.ctx = canvasNode.getContext('2d');
    this.ctx.translate(.5, .5);

    this.cfg = {};
    this.config(config);
}
Engine.extend = CanvasObject.extend;
Engine.create = function(x, y, shape){
    return new CanvasObject(x, y, shape);
}
Engine.prototype = {
    constructor : Engine,

    config : function(cfg){
        cfg = cfg || {};

        this.cfg = merge({
            renderCallback : function(){}
        }, this.cfg, cfg);

        this.renderCallback = this.cfg.renderCallback;
    },
    set width(value){
        this.canvas && (this.canvas.width = value);
        return value;
    },
    get width(){
        return this.canvas.width;
    },
    set height(value){
        this.canvas && (this.canvas.height = value);
        return value;
    },
    get height(){
        return this.canvas.height;
    },
    //control---------------------------------------------
    set status(value){
        if(this._status !== this.DESTROY){
            this._status = value;
        }
        return this._status;
    },
    get status(){
        return this._status;
    },

    STOP : 0,
    PAUSE : 0,
    PLAY : 2,
    DESTROY : 9,

    play : function(){
        this.status = this.PLAY;
        this.refresh();
        return this;
    },
    stop : function(){
        this.status = this.STOP;
        this.list.length = 0;
        this.number = 0;
        return this;
    },
    pause : function(){
        this.status = this.PAUSE;
        return this;
    },

    refresh : function(){
        if(this.status === this.DESTROY){return;}
        if(this.status !== this.STOP){
            this.number = 0;
            if(!this.static){
                this.ctx.clearRect(0, 0, this.width, this.height);
                
                this.render(this.list);
            }
            else{
                this.list.length = 0;
            }
        }
        this.fpsCalc();
        requestAnimationFrame(this.refresh.bind(this));
    },
    //render---------------------------------------------
    static : false, //静态
    render : function(list){
        var obj, 
            fps = this.fps, 
            context = this.ctx;
        for(var i = 0; i < list.length; i++){
            obj = list[i];
            if(Array.isArray(obj)){
                if(obj.config){
                    context.save();
                    this.config(obj.config);
                    this.render(obj);
                    context.restore();
                }
                else{
                    this.render(obj);
                }
                continue;
            }
            context.save();
            context.translate(obj.x, obj.y);
            obj.draw(context, fps);
            this.number++;
            context.restore();
            if(obj.die){
                list.splice(i, 1);
                i--;
            }
        };
        return this;
    },
    //object---------------------------------------------
    create : function(x, y, shape){
        return Engine.create(x, y, shape);
    },
    add : function(obj, list){
        (list || this.list).push(obj);
        obj.engine = this;
        return this;
    },
    del : function(obj){
        obj.die = true;
        return this;
    },
    //fps---------------------------------------------
    timestamp : null,
    _fpsCounter : 1,
    _fpsFrequency : 60,
    fpsCalc : function(){
        if(this._fpsCounter++ >= this._fpsFrequency){
            if(this.timestamp){
                this.fps = (this._fpsFrequency / (Date.now() - this.timestamp) * 1000).toFixed(2);
            }
            this.timestamp = Date.now();
            this._fpsCounter = 1;
            this.renderCallback(this);
        }
    },
    //distroy---------------------------------------------
    destroy : function(){
        this.stop();
        this.status = this.DESTROY;
        this.list = [];
    }
};

window.NPCanvas = Engine;
module.exports = Engine;