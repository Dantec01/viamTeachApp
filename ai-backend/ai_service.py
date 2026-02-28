import json
import ollama

def analyze_observation_with_ollama(transcript: str) -> dict:
    """
    Envía la transcripción a Ollama local para generar el reporte de Montessori.
    Espera recibir un JSON con las puntuaciones y las sugerencias.
    """
    
    prompt = f"""
    Eres un guía experto en el método educativo Montessori. Analiza la siguiente observación en vivo hecha por un profesor sobre un alumno, y evalúa las 4 dimensiones del desarrollo (Ser, Saber, Hacer, Decidir).

    Observación del Profesor:
    "{transcript}"

    Tu tarea es devolver ÚNICAMENTE un objeto JSON válido con la siguiente estructura, sin texto adicional antes ni después:
    {{
        "score_ser": (número del 0 al 100),
        "score_saber": (número del 0 al 100),
        "score_hacer": (número del 0 al 100),
        "score_decidir": (número del 0 al 100),
        "qualitative_summary": "Un resumen cualitativo de 2 o 3 oraciones sobre el estado del niño.",
        "montessori_guide": "Una lista de 2 viñetas con recomendaciones prácticas Montessori para el aula."
    }}
    """

    try:
        # Se asume que el modelo 'llama3' (o el más ligero 'phi3') está instalado en Ollama local
        # Para entornos más livianos, cambia "llama3" por "phi3" o "gemma:2b"
        response = ollama.chat(
            model='llama3',
            messages=[{'role': 'user', 'content': prompt}]
        )
        
        response_text = response['message']['content']
        
        # Limpiar la respuesta en caso de que el modelo escupa texto extra además del JSON
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        
        if start_idx != -1 and end_idx != -1:
            json_str = response_text[start_idx:end_idx]
            return json.loads(json_str)
        else:
            raise ValueError("Ollama no devolvió un JSON válido.")
            
    except Exception as e:
        print(f"Error procesando con Ollama: {e}")
        # Valores de fallback en caso de error
        return {
            "score_ser": 0, "score_saber": 0, "score_hacer": 0, "score_decidir": 0,
            "qualitative_summary": "Error al contactar con la IA local.",
            "montessori_guide": "Revise que Ollama esté corriendo y el modelo instalado."
        }
