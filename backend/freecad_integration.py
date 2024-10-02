import FreeCAD
import os

# PROJECT_PATH = r"C:\Users\ljfit\Desktop\Coding Projects\floor-planner-electron\roof_templates\pitched_wooden\Continue.FCStd" # UPDATE THIS PATH

# Set the path to the roof templates inside the Docker container
TEMPLATES_PATH = "/app/roof_templates/wooden_pitched/"

# Set the path to the roof templates outside the Docker container
def load_roof_template(roof_type="Continue.FCStd"):
    """
    Load the appropriate FreeCAD roof template based on the roof type.
    :param roof_type: String representing the roof type (e.g., 'pitched_wooden')
    :return: The loaded FreeCAD document object.
    """
    # Update with the specific roof template location
    roof_file = os.path.join(TEMPLATES_PATH, roof_type)
    
    if not os.path.exists(roof_file):
        raise FileNotFoundError(f"Roof template file '{roof_file}' not found.")
    
    try:
        # Open the FreeCAD document
        doc = FreeCAD.open(roof_file)
        return doc
    
    except Exception as e:
        raise RuntimeError(f"Error loading roof template: {e}") from e

def update_roof_in_freecad(roof_data):
    """
    Update the roof template based on user input.
    :param roof_data: Dictionary containing roof type, pitch, length, and width.
    """
    try:
        # Load the template for the selected roof type
        doc = load_roof_template(roof_data['roof_type'])

        # Access the roof object (replace with actual object name in FreeCAD)
        roof_obj = doc.getObject("RoofObject")  
        roof_obj.Pitch = roof_data['pitch']
        roof_obj.Length = roof_data['length']
        roof_obj.Width = roof_data['width']

        # Recompute and save the FreeCAD document
        doc.recompute()
        doc.save()

        print("Roof updated successfully.")
    except Exception as e:
        print(f"Error updating roof: {e}")