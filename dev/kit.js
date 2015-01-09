var $ = {
    requestAnimationFrame : null
        || window.requestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.msRequestAnimationFrame
        || window.oRequestAnimationFrame
        || function(callback) {setTimeout(callback, 1000 / 60);},
    merge : function(){
        var rs = {}, cur, args = arguments;
        for(var i = 0, j = arguments.length; i < j; i++){
            cur = arguments[i];
            for(var key in cur){
                if(!cur.hasOwnProperty(key)){continue;}
                rs[key] = cur[key];
            }
        }
        return rs;
    }
}
module.exports = $;