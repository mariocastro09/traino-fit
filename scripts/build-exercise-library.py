"""Builds public/data/ejercicios.json from the exercises dataset.

Source: https://github.com/hasaneyldrm/exercises-dataset (data/exercises.json).
Only the MIT-licensed data is used (names, muscles, equipment, Spanish
instructions). The dataset's images and GIFs are (c) Gym visual and are NOT
covered by that license, so they are deliberately left out.

Usage: python3 scripts/build-exercise-library.py path/to/exercises.json
"""
import json
import sys

CATEGORY = {
    "upper arms": "Brazos", "lower arms": "Antebrazos", "upper legs": "Piernas",
    "lower legs": "Pantorrillas", "back": "Espalda", "waist": "Core", "chest": "Pecho",
    "shoulders": "Hombros", "cardio": "Cardio", "neck": "Cuello",
}
EQUIPMENT = {
    "body weight": "Peso corporal", "dumbbell": "Mancuernas", "cable": "Polea",
    "barbell": "Barra", "leverage machine": "Máquina", "band": "Banda elástica",
    "smith machine": "Máquina Smith", "kettlebell": "Kettlebell", "weighted": "Con lastre",
    "stability ball": "Fitball", "ez barbell": "Barra EZ", "assisted": "Asistido",
    "sled machine": "Prensa / trineo", "medicine ball": "Balón medicinal", "rope": "Cuerda",
    "roller": "Foam roller", "resistance band": "Banda elástica", "bosu ball": "Bosu",
    "olympic barbell": "Barra", "wheel roller": "Rueda abdominal",
    "upper body ergometer": "Ergómetro de brazos", "skierg machine": "SkiErg",
    "hammer": "Mazo", "stationary bike": "Bicicleta estática", "tire": "Neumático",
    "trap bar": "Barra hexagonal", "elliptical machine": "Elíptica",
    "stepmill machine": "Escaladora",
}
TARGET = {
    "abs": "Abdominales", "pectorals": "Pectorales", "biceps": "Bíceps", "glutes": "Glúteos",
    "delts": "Deltoides", "triceps": "Tríceps", "upper back": "Espalda alta", "lats": "Dorsales",
    "calves": "Gemelos", "quads": "Cuádriceps", "forearms": "Antebrazos",
    "cardiovascular system": "Cardiovascular", "hamstrings": "Isquiotibiales",
    "spine": "Lumbares", "traps": "Trapecios", "adductors": "Aductores",
    "serratus anterior": "Serrato", "abductors": "Abductores",
    "levator scapulae": "Elevador de la escápula",
}

source = json.load(open(sys.argv[1], encoding="utf-8"))
library = [
    {
        "id": item["id"],
        "name": item["name"].strip().title(),
        "category": CATEGORY[item["category"]],
        "equipment": EQUIPMENT[item["equipment"]],
        "target": TARGET[item["target"]],
        "steps": [step.strip() for step in item["instruction_steps"]["es"] if step.strip()],
    }
    for item in source
]
library.sort(key=lambda exercise: exercise["name"])

out = "public/data/ejercicios.json"
json.dump(library, open(out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f"{len(library)} exercises -> {out}")
