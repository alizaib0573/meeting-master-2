export const SIZE_UTILS_COVER = 1;
export const SIZE_UTILS_CONTAIN = 2;

const getMathMethod = function(method) {
    switch (method) {
        case SIZE_UTILS_COVER:
            return Math.max;
        case SIZE_UTILS_CONTAIN:
            return Math.min;
    }
}

export const getSize = function(cw, ch, ew, eh, method) {
    const mathMethod = getMathMethod(method);    
    const scale = mathMethod(cw / ew, ch / eh);

    const width = Math.ceil(ew * scale);           
    const height = Math.ceil(eh * scale);      

    const values =  {
        x: (cw - width) * 0.5 >> 0, 
        y: (ch - height) * 0.5 >> 0, 
        width: width, 
        height: height, 
        scale: scale                
    };            
    values.cssText = ''.concat('left:', values.x, 'px; top:', values.y, 'px; width:', values.width, 'px; height:', values.height, 'px;');
    
    return values;
}

export const cover = function(cw, ch, ew, eh) {
    return getSize(cw, ch, ew, eh, SIZE_UTILS_COVER);
}

export const contain = function(cw, ch, ew, eh) {
    return getSize(cw, ch, ew, eh, SIZE_UTILS_CONTAIN);
}