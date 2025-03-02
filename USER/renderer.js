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
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
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
        let proj = this.subtract(normal.multiply(this.dot(normal)/(normal.norm()**2)))
        return proj
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

    GetNormal()
    {
        let v1v2 = this.v1.subtract(v2);
        let v1v3 = this.v1.subtract(v3);

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
      { "x": 1/6, "y": 0, "z": 0 },
      { "x": 0, "y": 1/6, "z": 0 },
      { "x": 1/6, "y": 1/6, "z": 0},
      { "x": 0, "y": 0, "z": 1/6 },
      { "x": 1/6, "y": 0, "z": 1/6 },
      { "x": 0, "y": 1/6, "z": 1/6 },
      { "x": 1/6, "y": 1/6, "z": 1/6}
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


function loadMeshFromJSON(jsonData,faces) 
{
    let points = jsonData.vertices.map(v => new Point(v.x, v.y, v.z));
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
        let l1 = v1.projectOntoScreen()
        let l2 = v2.projectOntoScreen()
        let l3 = v3.projectOntoScreen()

        
        bX.drawLine(l1.x,l1.y,l2.x,l2.y)
        bX.drawLine(l1.x,l1.y,l3.x,l3.y)
        bX.drawLine(l3.x,l3.y,l2.x,l2.y)
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
            mesh = loadMeshFromJSON(cubeObjJson,facesCube);
            drawMesh(mesh);
        } 
        else if (result === 2) 
        {
            onScreen = true;
            mesh = new Mesh(new Point(0,0,0),new Point(-0.25,1,1),new Point(1,0.25,0.5))
            mesh.mesh.forEach(tri => {
                let l1 = tri.v1.projectOntoScreen(camPlain, 300, 300);
                let l2 = tri.v2.projectOntoScreen(camPlain, 300, 300);
                let l3 = tri.v3.projectOntoScreen(camPlain, 300, 300);
            
                Pip.typeText(`${l1.toString()},${l2.toString()},${l3.toString()}`).then(() => {
                    setTimeout(() => {}, 1000);
                });
            });
            
            //drawMesh(mesh);
        } 
        else if (result === 3)
        {
            rotMod = !rotMod;
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