import sys
import os
import json
import easyocr
import logging

# Configurar logging para ver errores en STDERR
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("OCR")

def scan_image(image_path):
    try:
        logger.info(f"Cargando EasyOCR para la imagen: {image_path}")
        # La primera vez descargará modelos si no existen en ~/.EasyOCR/
        reader = easyocr.Reader(['es', 'en'], gpu=False)
        
        logger.info("Iniciando detección de texto...")
        results = reader.readtext(image_path)
        
        names = []
        for (bbox, text, prob) in results:
            clean = text.strip()
            # Ignoramos si es muy corto o parece puro número
            if len(clean) > 3 and any(c.isalpha() for c in clean):
                # Opcional: Filtro más estricto si quieres
                names.append(clean)
        
        logger.info(f"Detección finalizada. Encontrados: {len(names)} elementos.")
        return {"names": names}
    except Exception as e:
        logger.error(f"Error en scan_image: {str(e)}")
        return {"error": str(e), "names": []}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path"}))
        sys.exit(1)
        
    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(json.dumps({"error": f"Path not found: {image_path}"}))
        sys.exit(1)
        
    result = scan_image(image_path)
    print(json.dumps(result))
