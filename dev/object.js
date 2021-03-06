
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