(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./dev/engine');
},{"./dev/engine":2}],2:[function(require,module,exports){
var requestAnimationFrame = require('./kit').requestAnimationFrame;
var merge = require('./kit').merge;
var CanvasObject = require('./object');

var max = Math.max;

var sWidth = screen.width;

var stat = {
    STOP    : 0,
    PAUSE   : 1,
    PLAY    : 2,
    WAIT    : 4,
    DESTROY : 9
}
var evt = {
    renderCallback  : 'renderCallback',
    fpsCount        : 'fpsCount'
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
        ,fpsLimit    : null                             //限制渲染数
        ,perspective : null                             //透视平面距离, 800
        ,visionWidth : null                           //0距离尺寸

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
        if(typeof config.fpsLimit === 'number'){
            context._fpsFrequency = config.fpsLimit;
            context.requestAnimationFrame = function(func){
                setTimeout(func, 1000/config.fpsLimit);
            }
        }
        else{
            context._fpsFrequency = 60;
            context.requestAnimationFrame = requestAnimationFrame;
        }
        context.visionWidth = config.visionWidth || sWidth * 5 * context.config.pixelRatio;
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
            this.timestamp = Date.now();
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
            this.frame++;
            this.fire(evt.renderCallback);   
            if(this.number === 0){
                this.status = this.stat.WAIT;
            }
        }
        this.fpsCalc();
        (null, this.requestAnimationFrame)(this.refresh.bind(this));
    },
    requestAnimationFrame : requestAnimationFrame,
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
                if(this.config.perspective && obj.z){
                    //TODO z > perspective
                    var scale = 1 + (obj.z / this.config.perspective) * (this.visionWidth / this.width - 1);
                    context.scale(scale, scale);
                    context.translate(obj.x, obj.y);
                }
                else{
                    context.translate(obj.x, obj.y);
                }
                obj.draw(context, max(fps, 30));
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
    _fpsCounter : 1,
    _fpsFrequency : 60,
    fpsCalc : function(){
        if(this._fpsCounter++ >= this._fpsFrequency){
            this.fire(evt.fpsCount);
            this.fps = (this._fpsFrequency / (Date.now() - this.timestamp) * 1000).toFixed(2);
            this.timestamp = Date.now();
            this._fpsCounter = 1;
        }
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
},{"./kit":3,"./object":4}],3:[function(require,module,exports){
var $ = {
    requestAnimationFrame : null
        || window.requestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.msRequestAnimationFrame
        || window.oRequestAnimationFrame
        || function(callback) {setTimeout(callback, 1000 / 60);},
    merge : function(){
        var hold = typeof arguments[arguments.length - 1] === 'boolean', 
            holdRs = hold && arguments[arguments.length - 1];
        var rs = holdRs ? arguments[0] : {}, 
            cur, 
            args = arguments;
        for(var i = holdRs ? 1 : 0, j = arguments.length + (hold ? -1 : 0); i < j; i++){
            cur = arguments[i];
            if(typeof cur === 'object'){
                for(var key in cur){
                    if(cur.hasOwnProperty(key)){
                        rs[key] = cur[key];
                    }
                }   
            }
        }
        return rs;
    }
}
module.exports = $;
},{}],4:[function(require,module,exports){

var marker = 'np';
var CanvasObject = function(x, y, shape){
    if(typeof x === 'function'){
        shape = x;
        x = 0;
    }
    this.x = x || 0;
    this.y = y || 0;
    this.z = 0;
    this.shape = shape || function(){};
    this.die = false;
}
//构造器扩展构造器
CanvasObject.extend = function(newClassConstructor, proto){
    if(typeof newClassConstructor !== 'function'){
        newClassConstructor = function(){}
    }
    var parentFactory = this;
    if(!(this instanceof CanvasObject)){
        parentFactory = CanvasObject;
    }
    newClassConstructor.__proto__ = parentFactory;
    newClassConstructor.prototype = proto || new parentFactory;
    return newClassConstructor;
}
//对象扩展对象，或构造器
CanvasObject.prototype.extend = function(newClassConstructor){
    //构造器的话就用原来的extend啦
    if(typeof newClassConstructor === 'function'){
        return this.constructor.extend(newClassConstructor, this);
    }
    else{
        //对象扩展
        if(typeof newClassConstructor !== 'object' || newClassConstructor.toString() !== '[object Object]'){
            newClassConstructor = {};
        }
        newClassConstructor.__proto__ = this;
        return newClassConstructor;
    }
}

//绘制
CanvasObject.prototype.draw = function(ctx, fps){
    this.shape(ctx, fps);
}
//hit
// TODO
CanvasObject.prototype.hit = function(ctx, fps){
}
module.exports = CanvasObject;
},{}]},{},[1]);
