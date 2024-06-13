// the whole program is to generate the points and the lines between the points
// the points are generated randomly
// the lines are generated between the points which are close to each other
// the color of the lines are generated according to the distance between the points; the closer the points are, the darker the color is


!function () {
    function n(n, e, t) {
        return n.getAttribute(e) || t
    }
 
    function e(n) {
        return document.getElementsByTagName(n)
    }

    // n is to get the parameters of the script

    function randomRgbColor() {
        function randomInteger(max) {
            // Outputs a number between 0 and 255 inclusive
            return Math.floor(Math.random()*(max + 1));
        }
        let r = randomInteger(255);
        let g = randomInteger(255);
        let b = randomInteger(255);
    return r.toString() + "," + g.toString() + "," + b.toString();
    }

    function smoothRgbColor(tot, ind) {
        
        if (tot < 255 ) {
            let stepe = Math.trunc(255 / tot);
            let r = 100;
            let g = 100;
            let b = ind * stepe;
            return r.toString() + "," + g.toString() + "," + b.toString()}
        else if (tot < 255*255 ) {
            let nn = Math.trunc(Math.sqrt(tot));
            let stepe = Math.trunc(255 / nn);
            let r = 20;
            let g = Math.trunc(ind / nn) * stepe;
            let b = Math.trunc(ind % nn) * stepe;
            return r.toString() + "," + g.toString() + "," + b.toString()}
        else if (tot < 255*255*255 ) {
            let nn = Math.trunc(Math.pow(tot, 1/3));
            let stepe = Math.trunc(255 / nn);
            let r = Math.trunc(ind / (nn * nn)) * stepe
            let g = Math.trunc((ind % (nn * nn)) / (nn)) * stepe;
            let b = Math.trunc((ind % (nn * nn)) % (nn)) * stepe;
            return r.toString() + "," + g.toString() + "," + b.toString()}
    }
    function smooth2RgbColor(ind) {
        let stepe = Math.trunc(ind % 255);
        let r = Math.trunc(stepe);
        let g = Math.trunc(stepe);
        let b = Math.trunc(stepe);
        return r.toString() + "," + g.toString() + "," + b.toString()}

    function smooth2RgbColor_fl(ind) {
        let stepe = Math.trunc(ind % 255);
        let r = Math.trunc(stepe);
        let g = Math.trunc(stepe);
        let b = Math.trunc(stepe);
        return r,g,b }
    function e(n) {
        return document.getElementsByTagName(n)
    }
    // e is to get the elements of the document
    function t() {
        // t function is to generate the points
        var t = e("script"), o = t.length, i = t[o - 1];
        return {l: o, z: n(i, "zIndex", -1), o: n(i, "opacity", 0.5), c: n(i, "color", "#000000"), n: n(i, "count", 59)}
        // z is the z-index of the canvas 图层顺序。z=1意味着canvas在一切的上面，鼠标点不了一切, o is the opacity of the points, c is the color of the lines, n is the number of the points
    }
 
    function o() {
        // this function is to generate the points. The max number of points is 99
        a = m.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth, c = m.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    }
    
    function i() {
        // this function is to draw the lines
        r.clearRect(0, 0, a, c);
        var n, e, t, o, m, l;
        let indec = 0 ;
        s.forEach(function (i, x) {
        // s is the array of the points, x is the index of the points, i is the point
            for (i.x += i.xa, i.y += i.ya, i.xa *= i.x > a || i.x < 0 ? -1 : 1, i.ya *= i.y > c || i.y < 0 ? -1 : 1, r.fillRect(i.x - .5, i.y - .5, 1, 1), e = x + 1; e < u.length; e++) {
                // u is the array of the points, e is the index of the points, u[e] is the e-th point
                // i.x is the position of the points in the x direction, i.xa is the speed of the points in the x direction, 
                // a is the width of the canvas, c is the height of the canvas,
                // r is the canvas, r.fillRect() is to draw the points, r.fillRect(i.x - .5, i.y - .5, 1, 1) is to draw the points with the size of 1*1
                // i.xa can be positive or negative, if i.xa is positive, the points will move to the right
                // the judgement condition means that if the points are out of the canvas, the points will move to the opposite direction, 即反弹
                
                indec += 1 ;
                d.c = smooth2RgbColor(indec);
                d.c_r, d.c_g, d.c_b = smooth2RgbColor(indec);
                // d.c = randomRgbColor();
                n = u[e], // n is the e-th point
                null !== n.x && null !== n.y && 
                    (o = i.x - n.x, m = i.y - n.y,
                    // i, n is the points
                     l = o * o + m * m, 
                     // l is the distance between the points
                     l < n.max && (n === y && l >= n.max / 2 && (i.x -= .03 * o, i.y -= .03 * m), 
                     // this line is to make the points move to the opposite direction when the distance between the points is smaller than the max distance
                     t = (n.max - l) / n.max, 
                    // t is the opacity (不透明度) of the lines
                     r.beginPath(), 
                     // r is the canvas, r.beginPath() is to start drawing the lines
                     // r.moveTo() is to set the start point of the line
                     r.lineWidth = t / 2, 
                     r.strokeStyle = "rgba(" + Math.trunc((215 + (1-t)*205) % 255).toString() + "," + Math.trunc(106 - (1-t)*205).toString() + "," + Math.trunc(190).toString() + "," + (.5 + t) + ")",
                     // if i want to set the color of lines as sky blue, the rgb should be (135,206,250), the rgba should be (135,206,250,1)
                     // r.strokeStyle is to set the color of the line, the color is set according to the distance between the points, (t + 2) is alpha of rgba
                     r.moveTo(i.x, i.y), 
                     // r.lineTo() is to set the end point of the line
                     r.lineTo(n.x, n.y), r.stroke()))
                     // r.stroke() is to draw the line
            }
        }), x(i)
        
    }
 
    var a, c, u, m = document.createElement("canvas"), d = t(), l = "c_n" + d.l, r = m.getContext("2d"),
    // d is the object of the canvas, d.l is the number of the canvas, d.z is the z-index of the canvas, d.o is the opacity of the canvas, d.c is the color of the lines, d.n is the number of the points
        x = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (n) {
            window.setTimeout(n, 1e3 / 45)
            // this line is to set the frame rate of the animation, n is the function to be executed, frame rate is 45
        }, w = Math.random, y = {x: null, y: null, max: 2e4};
        // 2e4 means the max distance between the points
    m.id = l, m.style.cssText = "position:fixed;top:0;left:0;z-index:" + d.z + ";opacity:" + d.o, e("body")[0].appendChild(m), o(), window.onresize = o, window.onmousemove = function (n) {
        n = n || window.event, y.x = n.clientX, y.y = n.clientY
    }, window.onmouseout = function () {
        y.x = null, y.y = null
    };
    
    for (var s = [], f = 0; d.n > f; f++) {
        // f is the index of the points
        // this loop is to generate the points
        
        var h = w() * a, g = w() * c, v = 2 * w() - 1, p = 2 * w() - 1;
        // h is the x position of the points, g is the y position of the points, v is the speed of the points in the x direction, p is the speed of the points in the y direction
        // a and c are the width and height of the canvas, w() is to generate a random number between 0 and 1
        s.push({x: h, y: g, xa: v, ya: p, max: 6e3})
        // s is the array of the points, s.push() is to add the points to the array, 6e3 is the max distance between the points
    }
    u = s.concat([y]), setTimeout(function () {
        // concat is to add the y point to the array of the points
        i()
        // i is to draw the lines
    }, 500) // waiting for 10 seconds to start the animation
}();
// if want to change the color of the lines with the animation