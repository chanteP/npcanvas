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