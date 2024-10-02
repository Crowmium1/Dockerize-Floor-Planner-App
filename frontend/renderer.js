// // Import Konva (assuming you're using a bundler like Webpack or similar)
// const Konva = require('konva');

// // Initialize Layers Array and Current Layer Index
// let layers = [];
// let currentLayerIndex = 0;

// Initialize Konva Stage
const stage = new Konva.Stage({
    container: 'floor-plan',  // This should be the ID of the canvas container in your HTML
    width: 800,
    height: 600
});

// Create a default layer to hold elements
let layer = new Konva.Layer();
stage.add(layer);

// Function to start drawing (e.g., when mouse is pressed)
document.getElementById('floor-plan').addEventListener('mousedown', (e) => {
    isDrawing = true;
    const pos = stage.getPointerPosition();
    const wall = new Konva.Line({
        points: [pos.x, pos.y],
        stroke: 'black',
        strokeWidth: 5,
        lineCap: 'round',
        lineJoin: 'round',
        draggable: true,
    });
    layer.add(wall);
    layer.draw();
});

// Continue drawing when the mouse is moving
document.getElementById('floor-plan').addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const pos = stage.getPointerPosition();
    const lastLine = layer.findOne('Line');
    const newPoints = lastLine.points().concat([pos.x, pos.y]);
    lastLine.points(newPoints);
    layer.draw();
});

// Stop drawing (e.g., when mouse is released)
document.getElementById('floor-plan').addEventListener('mouseup', () => {
    isDrawing = false;
});

function createNewLayer() {
    const layerName = prompt('Enter layer name:', `Layer ${layers.length + 1}`);
    if (!layerName) return;  // If user cancels or leaves empty

    const newLayer = new Konva.Layer();
    newLayer.name(layerName);  // Assign the name to the layer
    stage.add(newLayer);
    layers.push(newLayer);
    switchLayer(layers.length - 1);

    // Add layer to the layers container in the UI
    const layerItem = document.createElement('div');
    layerItem.textContent = layerName;
    layerItem.id = `layer-item-${layers.length - 1}`;
    layerItem.style.cursor = 'pointer';
    layerItem.style.padding = '5px';
    layerItem.style.border = '1px solid #ccc';
    layerItem.style.marginBottom = '5px';
    layerItem.addEventListener('click', () => switchLayer(layers.length - 1));
    
    const visibilityCheckbox = document.createElement('input');
    visibilityCheckbox.type = 'checkbox';
    visibilityCheckbox.checked = true;
    visibilityCheckbox.addEventListener('change', (e) => {
        newLayer.visible(e.target.checked);
        stage.draw();
    });
    
    layerItem.prepend(visibilityCheckbox);
    document.getElementById('layers-container').appendChild(layerItem);
}

// Function to switch between layers
function switchLayer(index) {
    currentLayerIndex = index;
    layers.forEach((layer, i) => {
        if (i === currentLayerIndex) {
            layer.show();
        } else {
            layer.hide();
        }
    });
    stage.draw();
}

// Add event listener to create a new layer
document.getElementById('add-layer').addEventListener('click', createNewLayer);

// Create the first default layer
createNewLayer();

// Function to calculate heat loss using FastAPI backend
async function calculateHeatLoss(materialType, materialSize) {
    try {
        const response = await fetch('http://localhost:8000/calculate-heat-loss', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ material_type: materialType, material_size: materialSize })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.heat_loss;
    } catch (error) {
        console.error('Error calculating heat loss for ${materialType}:', error);
        alert('Failed to calculate heat loss ${materialType}.');
        return null;
    }
}

document.getElementById('material-type').addEventListener('change', async (e) => {
    const materialType = e.target.value;
    const materialSize = parseFloat(document.getElementById('material-size').value) || 0;
    if (materialSize > 0) {
        const heatLoss = await calculateHeatLoss(materialType, materialSize);
        if (heatLoss !== null) {
            updateSummarySection(materialType, materialSize, heatLoss);
        }
    }
});

// Event listener for material size changes to calculate heat loss	
document.getElementById('material-size').addEventListener('input', async (e) => {
    const materialSize = parseFloat(e.target.value) || 0;
    const materialType = document.getElementById('material-type').value;
    if (materialSize > 0) {
        const heatLoss = await calculateHeatLoss(materialType, materialSize);
        if (heatLoss !== null) {
            updateSummarySection(materialType, materialSize, heatLoss);
        }
    }
});

// Function to update the summary section with real-time roof data
function updateSummary(elementType, details) {
    const summaryElement = document.getElementById('element-summary');
    summaryElement.innerHTML = `
        <h3>Summary</h3>
        <p>${elementType}: ${details}</p>`;}

// Function to update the summary section with material and heat loss data
function updateSummarySection(materialType, materialSize, heatLoss) {
    const summaryElement = document.getElementById('summary');
    summaryElement.innerHTML = `
        <h3>Summary</h3>
        <p>Material Type: ${materialType}</p>
        <p>Material Size: ${materialSize} m²</p>
        <p>Heat Loss: ${heatLoss} W/m²K</p>
    `;
}

// Example: Update summary when adding a wall
async function addWall() {
    let wall = new Konva.Rect({
        x: 50,
        y: 50,
        width: 200,
        height: 20,
        fill: 'gray',
        draggable: true
    });
    layers[currentLayerIndex].add(wall);
    layers[currentLayerIndex].draw();
    const heatLoss = await calculateElementHeatLoss('Wall', 'concrete', 200);
    if (heatLoss !== null) {
        updateSummary('Wall', `Length: 200px, Height: 20px, Heat Loss: ${heatLoss} W`);
    }
}

// Add a wall when the user clicks 'Add Wall'
document.getElementById('add-wall').addEventListener('click', addWall);

// Function to add a window (as a rectangle)
function addWindow() {
    let window = new Konva.Rect({
        x: 100,
        y: 100,
        width: 100,
        height: 50,
        fill: 'blue',
        draggable: true
    });
    layers[currentLayerIndex].add(window);
    layers[currentLayerIndex].draw();
    updateSummary('Window', `Width: 100px, Height: 50px`);
}

// Add a window when the user clicks 'Add Window'
document.getElementById('add-window').addEventListener('click', addWindow);

// Roof Settings Interaction
document.getElementById('select-roof').addEventListener('click', () => {
    document.getElementById('roof-settings').style.display = 'block';  // Show the roof settings form
});

// Function to update the roof dimensions via FastAPI
async function updateRoof() {
    const roofType = document.getElementById('roof-type').value;
    const pitch = parseFloat(document.getElementById('roof-pitch').value);
    const length = parseFloat(document.getElementById('roof-length').value);
    const width = parseFloat(document.getElementById('roof-width').value);

    if (!roofType || isNaN(pitch) || isNaN(length) || isNaN(width)) {
        alert('Please fill in all roof settings correctly.');
        return;
    }

    const roofData = { roof_type: roofType, pitch, length, width };

    try {
        const response = await fetch('http://127.0.0.1:8000/update-roof/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(roofData)
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert(result.message);
        } else {
            throw new Error(result.message);
        }

        // Use Konva to visually update the roof based on type
        let roofPoints;
        if (roofType === 'gabled') {
            roofPoints = [
                length / 2 - width / 2, 0,
                length / 2 + width / 2, 0,
                length / 2, -pitch
            ];
        } else if (roofType === 'flat') {
            roofPoints = [
                0, 0,
                length, 0,
                length, -pitch / 2,
                0, -pitch / 2
            ];
        } else if (roofType === 'hipped') {
            roofPoints = [
                0, -pitch / 2,
                length / 2, -pitch,
                length, -pitch / 2,
                length, 0,
                0, 0
            ];
        }

        const roof = new Konva.Line({
            points: roofPoints,
            fill: 'brown',
            stroke: 'black',
            strokeWidth: 2,
            closed: true,
            draggable: true,
            name: 'Roof'
        });

        // Clear any existing roof before adding the new one
        layers[currentLayerIndex].find('.Roof').forEach(existingRoof => existingRoof.destroy());

        layers[currentLayerIndex].add(roof);
        layers[currentLayerIndex].draw();

        // Update the summary with the new roof details
        updateSummary('Roof', `Type: ${roofType}, Length: ${length}m, Width: ${width}m, Pitch: ${pitch}°`);

    } catch (error) {
        console.error('Error updating roof:', error);
        alert('Error updating roof: ' + error.message);
    }
}

// Add event listener for the "Update Roof" button
document.getElementById('update-roof').addEventListener('click', updateRoof);

// Function to save the project (e.g., export as JSON or image)
document.getElementById('save-project').addEventListener('click', () => {
    const dataURL = stage.toDataURL();
    const link = document.createElement('a');
    link.download = 'floor-plan.png';
    link.href = dataURL;
    link.click();
});

document.getElementById('delete-object').addEventListener('click', () => {
    const transformer = layer.findOne('Transformer');
    if (transformer && transformer.node()) {
        transformer.node().destroy();
        transformer.destroy();
        layer.draw();
        updateSummary('Object', 'Deleted an object');
    }
});

document.getElementById('export-project').addEventListener('click', () => {
    const json = stage.toJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'floor-plan.json';
    link.href = URL.createObjectURL(blob);
    link.click();
});

let drawingMode = null;
let currentShape = null;
let isDrawing = false;

// Set up event listeners for drawing tools
document.getElementById('draw-line').addEventListener('click', () => {
    drawingMode = 'line';
    fabricCanvas.isDrawingMode = false;
});

document.getElementById('draw-circle').addEventListener('click', () => {
    drawingMode = 'circle';
    fabricCanvas.isDrawingMode = false;
});

document.getElementById('draw-freehand').addEventListener('click', () => {
    drawingMode = 'freehand';
    fabricCanvas.isDrawingMode = true;
});

// Handle mouse events for drawing
stage.on('mousedown', (e) => {
    if (!drawingMode) return;

    isDrawing = true;
    const pos = stage.getPointerPosition();

    if (drawingMode === 'line') {
        currentShape = new Konva.Line({
            points: [pos.x, pos.y, pos.x, pos.y],
            stroke: 'black',
            strokeWidth: 2,
            draggable: true,
            name: 'Line'
        });
        layers[currentLayerIndex].add(currentShape);
    } else if (drawingMode === 'circle') {
        currentShape = new Konva.Circle({
            x: pos.x,
            y: pos.y,
            radius: 0,
            stroke: 'green',
            strokeWidth: 2,
            draggable: true,
            name: 'Circle'
        });
        layers[currentLayerIndex].add(currentShape);
    }
});

stage.on('mousemove', (e) => {
    if (!isDrawing || !currentShape) return;

    const pos = stage.getPointerPosition();

    if (drawingMode === 'line') {
        const points = currentShape.points();
        points[2] = pos.x;
        points[3] = pos.y;
        currentShape.points(points);
    } else if (drawingMode === 'circle') {
        const dx = pos.x - currentShape.x();
        const dy = pos.y - currentShape.y();
        const radius = Math.sqrt(dx * dx + dy * dy);
        currentShape.radius(radius);
    }
    layers[currentLayerIndex].batchDraw();
});

stage.on('mouseup', () => {
    if (isDrawing) {
        isDrawing = false;
        currentShape = null;
    }
});

let history = [];
let historyStep = -1;

// Function to save the current state to history
function saveHistory() {
    const json = stage.toJSON();
    // Remove any redo steps
    history = history.slice(0, historyStep + 1);
    history.push(json);
    historyStep++;
}

// Initial save
saveHistory();

// Event listeners for undo and redo
document.getElementById('undo-action').addEventListener('click', () => {
    if (historyStep > 0) {
        historyStep--;
        stage.destroy();
        const previousStage = Konva.Node.create(history[historyStep], 'floor-plan');
        stage.width(previousStage.width());
        stage.height(previousStage.height());
        previousStage.getLayers().forEach(layer => stage.add(layer));
        stage.draw();
    }
});

document.getElementById('redo-action').addEventListener('click', () => {
    if (historyStep < history.length - 1) {
        historyStep++;
        stage.destroy();
        const nextStage = Konva.Node.create(history[historyStep], 'floor-plan');
        stage.width(nextStage.width());
        stage.height(nextStage.height());
        nextStage.getLayers().forEach(layer => stage.add(layer));
        stage.draw();
    }
});

// Save history after each change
stage.on('change', saveHistory);

stage.on('click', function (e) {
    // Click on empty area - remove all selections
    if (e.target === stage) {
        layer.find('Transformer').destroy();
        layer.draw();
        return;
    }

    // Click on some object
    const selectedNode = e.target;

    // Create a Transformer
    const tr = new Konva.Transformer();
    layer.add(tr);
    tr.attachTo(selectedNode);
    layer.draw();
});

// Function to gather building data
function gatherBuildingData() {
    const buildingData = [];
    layers.forEach(layer => {
        layer.find('.Rect').forEach(rect => {
            const type = rect.fill();
            const dimension = type === 'gray' ? `${rect.width()}px x ${rect.height()}px` :
                               type === 'blue' ? `${rect.width()}px x ${rect.height()}px` : 'N/A';
            buildingData.push({ element: type === 'gray' ? 'Wall' : type === 'blue' ? 'Window' : 'Roof', dimension });
        });
        layer.find('.Line').forEach(line => {
            buildingData.push({ element: 'Line', dimension: `${line.points().length / 2} points` });
        });
        layer.find('.Circle').forEach(circle => {
            buildingData.push({ element: 'Circle', dimension: `Radius: ${circle.radius()}px` });
        });
    });
    return buildingData;
}


// Function to export building data to Excel via FastAPI
async function exportToExcel() {
    const buildingData = gatherBuildingData();
    try {
        const response = await fetch('http://localhost:8000/export-excel/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildingData)
        });
        const result = await response.json();
        if (result.status === 'success') {
            alert(result.message);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Error exporting to Excel: ' + error.message);
    }
}

// Add event listener for the "Export to Excel" button
document.getElementById('export-excel').addEventListener('click', exportToExcel);
