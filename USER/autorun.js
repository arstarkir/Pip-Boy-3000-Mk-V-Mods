let playerPos = 200; 

// Create a buffer for the static elements (rectangle)
let bX = Graphics.createArrayBuffer(400, 320, 1, { msb: true });

function drawStaticElements() {
    let rectWidth = 200;
    let rectHeight = 150;
    let rectX = (400 - rectWidth) / 2;
    let rectY = (320 - rectHeight) / 2;

    bX.clear().drawRect(rectX, rectY, rectX + rectWidth, rectY + rectHeight);

    bC.clear().drawImage(
        { width: 400, height: 320, bpp: 1, buffer: bX.buffer },
        38, 0
    );
    bC.flip();
}

function drawMovingLine() {
    let rectY = (320 - 150) / 2;
    let rectHeight = 150;

    bC.clearRect(playerPos - 1, rectY, playerPos + 1, rectY + rectHeight);
    bC.drawLine(playerPos, rectY, playerPos, rectY + rectHeight);
    bC.flip();
}

function onKnob2(input) {
    let oldX = playerPos;

    if (input === -1) playerPos = Math.max(50, playerPos - 10);
    if (input === 1) playerPos = Math.min(350, playerPos + 10);

    if (oldX !== playerPos) {
        drawMovingLine();
    }
}

function customTorchFunction() {
    Pip.typeText("Torch button remapped!");
    drawStaticElements();
    drawMovingLine();
}

drawStaticElements();
drawMovingLine();

setWatch(customTorchFunction, BTN_TORCH, { repeat: true, edge: 'rising' });
Pip.on("knob2", onKnob2);

