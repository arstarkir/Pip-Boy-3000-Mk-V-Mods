class Point 
{
    constructor(x, y, z) 
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

}

class Vector 
{
    constructor(p1, p2) 
    {
        this.x = p2.x - p1.x;
        this.y = p2.y - p1.y;
        this.z = p2.z - p1.z;
    }

    add(other) 
    {
        return new Vector(new Point(0, 0, 0), new Point(this.x + other.x, this.y + other.y, this.z + other.z));
    }
    
    subtract(other) 
    {
        return new Vector(new Point(0, 0, 0), new Point(this.x - other.x, this.y - other.y, this.z - other.z));
    }
    
    multiply(num) 
    {
        return new Vector(new Point(0, 0, 0), new Point(this.x * num, this.y * num, this.z * num));
    }

    cross(other) 
    {
        return new Vector(new Point(0, 0, 0),
            new Point(this.y * other.z - this.z * other.y,
                this.z * other.x - this.x * other.z,
                this.x * other.y - this.y * other.x));
    }

    dist() 
    {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
    }

    norm() 
    {
        let mag = this.dist();
        return new Vector(new Point(0, 0, 0),
            new Point(this.x / mag, this.y / mag, this.z / mag));
    }
    
    dot(other) 
    {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    projectOntoScreen(camPlain, screenWidth, screenHeight) 
    {
        let normal = camPlain.GetNormal();
        let proj = this.subtract(normal.multiply(this.dot(normal)/(Math.pow(normal.dist(),2))))
        return proj
    }
    
    toString()
    {
        return `Vec(${this.x},${this.y},${this.z})`
    }

    perspectiveProj(camPlain, screenWidth, screenHeight, FOV, zFar)
    {
        let aspectR = screenHeight/screenWidth;
        let scaleF = 1/(Math.tan(FOV/2));
        let zNormalizer = (zFar/(zFar - camPlain.GetCenter().z));
        return new Vector(new Point(0,0,0),new Point(aspectR*scaleF*this.x, scaleF*this.y,((this.z * zNormalizer -(zFar/(zFar - camPlain.GetCenter().z)*camPlain.GetCenter().z)))))
    }
}

class Polygon 
{ 
    constructor(p1, p2, p3) 
    {
        this.v1 = new Vector(p1, p2);
        this.v2 = new Vector(p2, p3);
        this.v3 = new Vector(p3, p1);
    }

    GetCenter()
    {
        return new Vector(new Point(0,0,0),new Point((this.v1.x + this.v2.x + this.v3.x)/3,(this.v1.y + this.v2.y + this.v3.y)/3,(this.v1.z + this.v2.z + this.v3.z)/3))
    }

    GetNormal()
    {
        let v1v2 = this.v1.subtract(this.v2);
        let v1v3 = this.v1.subtract(this.v3);

        return v1v2.cross(v1v3);
    }
}

class Mesh 
{
    constructor() 
    {
        this.mesh = [];
    }

    addPolygon(Polygon) 
    {
        this.mesh.push(Polygon);
    }
}

let camPlain = new Polygon(new Point(3,3,0),new Point(2,4,0),new Point(3,5,0));

const cubeObjJson = {
    "vertices": [
      { "x": 0, "y": 0, "z": 0 },
      { "x": 1, "y": 0, "z": 0 },
      { "x": 0, "y": 1, "z": 0 },
      { "x": 1, "y": 1, "z": 0},
      { "x": 0, "y": 0, "z": 1 },
      { "x": 1, "y": 0, "z": 1 },
      { "x": 0, "y": 1, "z": 1 },
      { "x": 1, "y": 1, "z": 1}
    ]
};

let facesCube = [
    [0, 1, 2], [0, 2, 3],
    [0, 1, 4], [0, 1, 5],
    [1, 3, 7], [1, 3, 5],
    [2, 3, 7], [2, 3, 6],
    [0, 2, 4], [0, 2, 6],
    [5, 6, 7], [5, 6, 4]
];

const pyramidObjJson = {
    "vertices": [
      { "x": 0, "y": 0, "z": 0 },
      { "x": 1, "y": 0, "z": 0 },
      { "x": 1, "y": 1, "z": 0 },
      { "x": 0, "y": 1, "z": 0 },
      { "x": 0.5, "y": 0.5, "z": 1.6 }
    ]
};

let facesPyramid = [
    [0, 1, 2], [0, 2, 3],
    [1, 2, 3], [0, 1, 3]
];


function loadMeshFromJSON(jsonData,faces, mult) 
{
    let points = jsonData.vertices.map(v => new Point(v.x * mult, v.y* mult, v.z* mult));
    let mesh = new Mesh();

    faces.forEach(face => {mesh.addPolygon(new Polygon(points[face[0]], points[face[1]], points[face[2]]));});

    return mesh;
}

let onScreen = false
let frameCounter = 0

function drawMesh(mesh) 
{
    let bX = Graphics.createArrayBuffer(300, 300, 1, { msb: true });
    mesh.mesh.forEach( tri => { 
        let l1 = tri.v1.perspectiveProj(camPlain,300,300,120,1)
        let l2 = tri.v2.perspectiveProj(camPlain,300,300,120,1)
        let l3 = tri.v3.perspectiveProj(camPlain,300,300,120,1)

        
        bX.drawLine(l1.x+150,l1.y+150,l2.x+150,l2.y+150)
        bX.drawLine(l1.x+150,l1.y+150,l3.x+150,l3.y+150)
        bX.drawLine(l3.x+150,l3.y+150,l2.x+150,l2.y+150)
    });
    
    frameCounter++;

    bC.clear().drawImage(
        { width: 300, height: 300, bpp: 1, buffer: bX.buffer },
        38, 0
    );
    bC.flip();
}

let rotMod = true

function customTorchFunction()
{
    E.showPrompt("Choose a mesh", {
    title: "Choose a mesh",
    buttons: {
        "Cube": 1,
        "Pyramid": 2,
        "RotationMode" : 3,
        "Back": 4,
    },}).then(result => { 
        if (result === 1) 
        {
            onScreen = true;
            mesh = loadMeshFromJSON(cubeObjJson,facesCube, 100);
            drawMesh(mesh);
        } 
        else if (result === 2) 
        {
            onScreen = true;
            bC.clear()
            mesh = loadMeshFromJSON(cubeObjJson,facesCube);
            let text = "";
            mesh.mesh.forEach(tri => {
                let l1 = tri.v1.perspectiveProj(camPlain,300,300,120,10)
                let l2 = tri.v2.perspectiveProj(camPlain,300,300,120,10)
                let l3 = tri.v3.perspectiveProj(camPlain,300,300,120,10)
                text += `${l1.toString()},${l2.toString()},${l3.toString()}
                `;
            });
            Pip.typeText(`(${text})${l1.toString()},${l2.toString()},${l3.toString()}
            `).then(() => {setTimeout(() => {}, 10);});

            //drawMesh(mesh);
        } 
        else if (result === 3)
        {
            let text = "";
            let l1 = new Vector(new Point(0,0,0),new Point(1,1,1));
            text += `V ${l1.toString()},
            `
            let aspectR = 300/300;
            let scaleF = 1/(Math.tan(120/2));
            let zNormalizer = (10/(10 - camPlain.GetCenter().z));
            text += `AR ${300/300},
            `
            text += `F ${1/(Math.tan(120/2))},
            `            
            text += `zN ${(10/(10 - camPlain.GetCenter().z))},
            `
            let proj = new Vector(new Point(0,0,0), new Point(aspectR*scaleF*l1.x, scaleF*l1.y,((l1.z * zNormalizer -(10/(10 - camPlain.GetCenter().z)*camPlain.GetCenter().z)))))
            text += `${proj.toString()},
            `

            Pip.typeText(`(${text})`).then(() => {setTimeout(() => {}, 10);});

            //rotMod = !rotMod;
        }
        else if (result === 4) 
        {
            onScreen = false;
            submenuApps();
        }});
}

function onKnob2(input) {
    if (onScreen) 
    {
        if (input === -1) 
            cameraPos.y -= 0.05;
        if (input === 1) 
            cameraPos.y += 0.05;
        drawMesh(mesh);
    }
}

function onKnob1(input) {
    if (onScreen) 
    {
        if(rotMod)
        {
            if (input === -1) 
                angleY -= Math.PI/8; 
            if (input === 1) 
                angleY += Math.PI/8;
            updateCameraPosition();
        }
        else
        {
            if (input === -1) 
                cameraPos.x -= 0.05;
            if (input === 1) 
                cameraPos.x += 0.05;
        }
        drawMesh(mesh);
    }
}

//Pip.on("knob2", onKnob2);
//Pip.on("knob1", onKnob1);
setWatch(customTorchFunction, BTN_TORCH, { repeat: true, edge: 'rising' });

Pip.typeText("Torch Remaped!").then(() => {
    setTimeout(() => {

    }, 1000)
  })