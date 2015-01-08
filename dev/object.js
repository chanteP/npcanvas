var CanvasObject = function(x, y, shape){
    if(arguments.length === 1){
        shape = x;
        x = 0;
    }
    this.x = x || 0;
    this.y = y || 0;
    this.shape = shape || function(){};
    this.die = false;

    this.CanvasObject = 'np';
}
CanvasObject.extend = CanvasObject.prototype.extend = function(newClassConstructor){
    newClassConstructor.prototype.__proto__ = new this;
    return newClassConstructor;
}
CanvasObject.prototype.draw = function(ctx, spf){
    this.shape(ctx, spf);
}
module.exports = CanvasObject;