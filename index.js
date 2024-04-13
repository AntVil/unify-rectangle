let canvas;
let ctxt;

let addingPoint;

let points;

window.onload = () => {
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctxt = canvas.getContext("2d");

    addingPoint = document.getElementById("add-point");

    points = [];

    canvas.onclick = e => {
        let scale = Math.min(canvas.width, canvas.height);
        let x = (e.clientX - canvas.width / 2) / scale;
        let y = (e.clientY - canvas.height / 2) / scale;

        if(addingPoint.checked) {
            // insert sorted by x then y
            let inserted = false;
            for(let i=0;i<points.length;i++) {
                if(
                    (points[i][0] < x) ||
                    (points[i][0] === x && points[i][1] < y)
                ) {
                    continue
                }

                points.splice(i, 0, [x, y]);
                inserted = true;
                break
            }
            if(!inserted) {
                points.push([x, y]);
            }
        } else {
            if(points.length === 0) {
                return
            }

            let index = 0;
            let distance = Infinity;
            for(let i=0;i<points.length;i++) {
                let d = Math.hypot(points[i][1] - y, points[i][0] - x);
                if(d < distance) {
                    distance = d;
                    index = i;
                }
            }

            points.splice(index, 1);
        }

        update();
    }

    update();
}

window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    update();
}

function update() {
    ctxt.setTransform(1, 0, 0, 1, 0, 0);
    ctxt.clearRect(0, 0, canvas.width, canvas.height);

    let scale = Math.min(canvas.width, canvas.height);
    ctxt.setTransform(scale, 0, 0, scale, canvas.width / 2, canvas.height / 2);

    renderRectangles(points);

    if(points.length > 0) {
        let boundary = calculateBoundary(points);
        renderBoundary(boundary);
    }
}

function renderRectangles(points) {
    ctxt.lineWidth = 0.003;
    ctxt.strokeStyle = "#000";
    ctxt.fillStyle = "#0006";
    for(let point of points) {
        ctxt.beginPath();
        ctxt.moveTo(0, 0);
        ctxt.lineTo(point[0], 0);
        ctxt.lineTo(point[0], point[1]);
        ctxt.lineTo(0, point[1]);
        ctxt.closePath();
        ctxt.fill();
        ctxt.stroke();
    }

    ctxt.fillStyle = "#000A";
    ctxt.beginPath();
    ctxt.arc(0, 0, 0.01, 0, 2 * Math.PI);
    ctxt.fill();
    for(let point of points) {
        ctxt.beginPath();
        ctxt.arc(point[0], point[1], 0.01, 0, 2 * Math.PI);
        ctxt.fill();
    }
}

function renderBoundary(points) {
    ctxt.strokeStyle = "#FFFA";
    ctxt.beginPath();
    ctxt.moveTo(points[0][0], points[0][1]);
    for(let point of points) {
        ctxt.lineTo(point[0], point[1]);
    }
    ctxt.closePath();
    ctxt.stroke();
}

function calculateBoundary(points) {
    let top;
    let bottom;

    // left to center
    let boundaryLeft = [];
    top = 0;
    bottom = 0;

    for(let i=0;i<points.length && points[i][0] < 0;i++) {
        if(points[i][1] < top) {
            // top left
            boundaryLeft.unshift([points[i][0], top]);
            boundaryLeft.unshift([points[i][0], points[i][1]]);

            top = points[i][1];
        }else if(points[i][1] > bottom) {
            // bottom left
            boundaryLeft.push([points[i][0], bottom]);
            boundaryLeft.push([points[i][0], points[i][1]]);

            bottom = points[i][1];
        }
    }

    // right to center
    let boundaryRight = [];
    top = 0;
    bottom = 0;

    for(let i=points.length-1;i>=0 && points[i][0] > 0;i--) {
        if(points[i][1] < top) {
            // top right
            boundaryRight.push([points[i][0], top]);
            boundaryRight.push([points[i][0], points[i][1]]);

            top = points[i][1];
        } else if(points[i][1] > bottom) {
            // bottom right
            boundaryRight.unshift([points[i][0], bottom]);
            boundaryRight.unshift([points[i][0], points[i][1]]);

            bottom = points[i][1];
        }
    }

    // merge results
    if(boundaryLeft.length > 0) {
        boundaryLeft.unshift([0, boundaryLeft[0][1]])
        boundaryLeft.push([0, boundaryLeft[boundaryLeft.length-1][1]])
    }
    if(boundaryRight.length > 0) {
        boundaryRight.push([0, boundaryRight[boundaryRight.length-1][1]])
        boundaryRight.unshift([0, boundaryRight[0][1]])
    }

    return [...boundaryLeft, ...boundaryRight]
}
