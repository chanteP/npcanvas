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