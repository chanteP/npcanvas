
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