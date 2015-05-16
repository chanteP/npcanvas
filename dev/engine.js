var requestAnimationFrame = require('./kit').requestAnimationFrame;
var merge = require('./kit').merge;
var CanvasObject = require('./object');

var max = Math.max;

var stat = {
    STOP    : 0,
    PAUSE   : 1,
    PLAY    : 2,
    WAIT    : 4,
    DESTROY : 9
}

var Engine = function(canvasNode, config){
    if(!canvasNode){throw 'canvasNode not found';}
    this.list = [];

    this.canvas = canvasNode;
    this.ctx = canvasNode.getContext('2d');

    this.fps = 60;                                      //fps
    this.number = 0;                                    //渲染物体数量

    this.config = merge({
        fitSize     : true                              //初始适应canvas节点尺寸
        ,pixelRatio : window.devicePixelRatio || 1      //分辨率
        ,lineFix    : true                              //0.5像素边缘修正

        ,engine     : this
        ,set : this._setConfig
    }, config);
    this.config.set.call(this, this.config);
}
//object
Engine.create = function(x, y, shape){
    return new CanvasObject(x, y, shape);
}
Engine.object = CanvasObject;
//method
Engine.prototype = {
    constructor : Engine,

    _setConfig : function(config){
        var context = this.engine || this;
        config = config || {};

        context.config = merge(context.config, config, true);

        if(config.fitSize){
            context.width = context.canvas.clientWidth * context.config.pixelRatio;
            context.height = context.canvas.clientHeight * context.config.pixelRatio;
        }
        if(config.lineFix){
            context.ctx.translate(.5, .5);
        }
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
    stat : stat,
    _status : stat.STOP,   
    set status(value){
        this.fire('stateChange');
        if(this._status === this.stat.DESTROY){return;}
        return this._status = value;
    },
    get status(){
        return this._status;
    },

    play : function(){
        if(this.status === this.stat.STOP){
            this.status = this.stat.PLAY;
            this.refresh();
        }
        this.status = this.stat.PLAY;
        return this;
    },
    stop : function(){
        this.status = this.stat.STOP;
        this.clean();
        this.number = 0;
        return this;
    },
    pause : function(){
        this.status = this.stat.PAUSE;
        return this;
    },

    refresh : function(){
        if(this.status === this.stat.DESTROY){return;}
        if(this.status === this.stat.PLAY){
            this.number = 0;
            if(!this.static){
                this.ctx.clearRect(0, 0, this.width, this.height);
                
                this.render(this.list);
            }
            else{
                this.clean();
            }
            if(this.number === 0){
                this.status = this.stat.WAIT;
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
                this.render(obj);
            }
            else{
                obj.life = this.timestamp - obj.timestamp;
                context.save();
                context.translate(obj.x, obj.y);
                obj.draw(context, max(fps, 30)); //TODO blur迷之延时
                this.number++;
                context.restore();
                if(obj.die){
                    list.splice(i, 1);
                    i--;
                }
            }
        };
        return this;
    },
    //object---------------------------------------------
    create : Engine.create,
    add : function(obj, list){
        (list || this.list).push(obj);
        obj.engine = this;
        obj.timestamp = this.timestamp;
        obj.life = 0;
        if(this.status === this.stat.WAIT){
            this.status = this.stat.PLAY;
        }
        return this;
    },
    del : function(obj){
        obj.die = true;
        return this;
    },
    clean : function(){
        this.list.splice(0, this.list.length);
    },
    //listener---------------------------------------------
    _listener : {},
    on : function(evt, func){
        if(typeof evt !== 'string' || typeof func !== 'function'){return this;}
        if(!Array.isArray(this._listener[evt])){
            this._listener[evt] = [];
        }
        this._listener[evt].push(func);
        return this;
    },
    off : function(evt, func){
        if(typeof evt !== 'string' || typeof func !== 'function'){return this;}
        if(!Array.isArray(this._listener[evt])){return this;}
        var index = this._listener[evt].indexOf(func);
        if(index < 0){return this;}
        this._listener[evt].splice(index, 1);
        return this;
    },
    fire : function(evt, args){
        if(!Array.isArray(this._listener[evt])){return this;}
        var npc = this;
        this._listener[evt].forEach(function(func){
            func.apply(npc, args);
        });
        return this;
    },
    //fps---------------------------------------------
    timestamp : null,
    frame : 0,
    life : 0,
    _fpsCounter : 1,
    _fpsFrequency : 60,
    fpsCalc : function(){
        if(this._fpsCounter++ >= this._fpsFrequency){
            this.fire('fpsCount');
            var dis = Date.now() - this.timestamp;
            if(this.timestamp){
                this.fps = (this._fpsFrequency / dis * 1000).toFixed(2);
            }
            this.timestamp = Date.now();
            this._fpsCounter = 1;
            if(this.status === this.stat.PLAY){
                this.life += dis;
                this.fire('renderCallback');   
            }
        }
        this.frame++;
    },
    //distroy---------------------------------------------
    destroy : function(){
        this.stop();
        this.status = this.stat.DESTROY;
        this.clean();
    }
};

if(typeof window.define === 'function'){
    define('NPCanvas', Engine);
}
module.exports = window.NPCanvas = Engine;