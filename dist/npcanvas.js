(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./dev/engine');
},{"./dev/engine":2}],2:[function(require,module,exports){
var requestAnimationFrame = require('./kit').requestAnimationFrame;
var parse = require('./kit').parse;
var CanvasObject = require('./object');

var Engine = function(canvasNode, config){
    if(!canvasNode){throw 'canvasNode not found';}
    this.list = [];

    this.canvas = canvasNode;

    this.fps = 60;
    this.number = 0;
    this.config(config);

    this.ctx = canvasNode.getContext('2d');
    this.ctx.translate(0.5, 0.5);
}
Engine.extend = CanvasObject.extend;
Engine.create = function(x, y, shape){
    return new CanvasObject(x, y, shape);
}
Engine.prototype = {
    constructor : Engine,

    config : function(cfg){
        cfg = cfg || {};
        this.renderCallback = cfg.renderCallback || this.renderCallback || function(){};
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
    status : 0,

    STOP : 0,
    PAUSE : 0,
    PLAY : 2,

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
        this.add(Engine.create(x, y, shape), this.list);
        return this;
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
    }
};

window.NPCanvas = Engine;
module.exports = Engine;
},{"./kit":3,"./object":4}],3:[function(require,module,exports){
var $ = {
    requestAnimationFrame : null
        || window.requestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.msRequestAnimationFrame
        || window.oRequestAnimationFrame
        || function(callback) {setTimeout(callback, 1000 / 60);},
    parse : function(obj1, obj2){
        var rs = {};
        for(var key in obj1){
            if(!obj1.hasOwnProperty(key)){continue;}
            if(key in obj2){
                rs[key] = obj2[key];
            }
            else{
                rs[key] = obj1[key];
            }
        }
        return rs;
    }
}
module.exports = $;
},{}],4:[function(require,module,exports){

var marker = 'np';
var CanvasObject = function(x, y, shape){
    if(arguments.length === 1){
        shape = x;
        x = 0;
    }
    this.x = x || 0;
    this.y = y || 0;
    this.shape = shape || function(){};
    this.die = false;

    this.CanvasObject = marker;
}
CanvasObject.CanvasClass = marker;
CanvasObject.extend = CanvasObject.prototype.extend = function(newClassConstructor){
    var parent = this;
    if(this.CanvasClass !== marker){
        parent = CanvasObject;
    }
    if(typeof this === 'function'){
        parent = new parent;   
    }
    newClassConstructor.prototype.__proto__ = parent;
    newClassConstructor.extend = CanvasObject.extend;
    newClassConstructor.CanvasClass = marker;
    return newClassConstructor;
}
CanvasObject.prototype.draw = function(ctx, fps){
    this.shape(ctx, fps);
}
module.exports = CanvasObject;
},{}]},{},[1]);
