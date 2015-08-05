function findWithAttr(array, attr, value, deep) {
    var muted = true;
    if(!muted) console.log('\t\t\tfindWithAttr - array', array);
    if(!muted) console.log('\t\t\tfindWithAttr - attr', attr);
    if(!muted) console.log('\t\t\tfindWithAttr - value', value);
    if (angular.isArray(array)) {
        for (var i = 0; i < array.length; i++) {
            if(!muted) console.log('\t\t\t\tfindWithAttr - array['+i+']['+attr+']', array[i][attr]);
            if (angular.isObject(array[i]) && array[i][attr] === value) {
                return i+1;
            }
        }
    }
}

function indexOfAll(array, value) {
    var indexArr = [];
    if (angular.isArray(array)) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === value) indexArr.push(i);
        }
    }
    return indexArr;
}

function isAny(item, possibilities) {
    var muted = false;
    if(!possibilities) return false;
    if(!muted) console.log('\n');
    if(!muted) console.log('isAny item', item);
    if(!muted) console.log('isAny possibilities', possibilities);
    if(!muted) console.log('isAny isAny', (possibilities.indexOf(item)>-1));
    if(angular.isArray(possibilities)) return (possibilities.indexOf(item) > -1);

}

function isContained(item, possibilities) {
    if(!possibilities) return false;
    var isContained = false;
    if(!angular.isArray(possibilities)) possibilities = [possibilities];
    for(var i=0; i < possibilities.length; i++) {
        if(possibilities[i].indexOf(item) > -1) {
            isContained = true;
            break;
        }
    }
    return isContained;
}