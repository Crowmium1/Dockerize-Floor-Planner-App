from fastapi import FastAPI
from pydantic import BaseModel
from freecad_integration import update_roof_in_freecad
import openpyxl

app = FastAPI()

class HeatLossRequest(BaseModel):
    material_type: str # e.g., 'wall', 'window'
    material_size: float
    dimension: float  # e.g., length or area

@app.post("/calculate-heat-loss")
async def calculate_heat_loss(request: HeatLossRequest):
    material_factor = {
        'concrete': 1.2,
        'wood': 0.8,
        'glass': 3.5,
    }.get(request.material_type.lower(), 1)
    
    heat_loss = request.material_size * material_factor * 5  # Modify as per actual formulas
    return {"heat_loss": heat_loss}

# Pydantic model for roof data
class RoofData(BaseModel):
    roof_type: str
    pitch: float
    length: float
    width: float

@app.post("/update-roof/")
async def update_roof(roof_data: RoofData):
    try:
        # Call the function to update the FreeCAD file based on roof data
        update_roof_in_freecad(roof_data.dict())
        return {"status": "success", "message": "Roof updated successfully"}
    except Exception as e:
        return {"status": "error", "message": f"Error updating roof: {e}"}

# Save the project
@app.post("/save-project/")
async def save_project():
    try:
        # Add logic to save FreeCAD project
        # Run a FreeCAD macro or command
        return {"status": "success", "message": "Project saved successfully"}
    except Exception as e:
        return {"status": "error", "message": f"Error saving project: {e}"}

@app.post("/export-excel/")
async def export_to_excel(building_data: list):
    try:
        workbook = openpyxl.Workbook()
        sheet = workbook.active

        # Add headers
        sheet["A1"] = "Element"
        sheet["B1"] = "Dimension"

        # Add data
        for index, data in enumerate(building_data, start=2):
            sheet[f"A{index}"] = data['element']
            sheet[f"B{index}"] = data['dimension']

        # Save to file
        workbook.save("building_dimensions.xlsx")
        return {"status": "success", "message": "Data exported to Excel"}
    except Exception as e:
        return {"status": "error", "message": f"Error exporting to Excel: {e}"}