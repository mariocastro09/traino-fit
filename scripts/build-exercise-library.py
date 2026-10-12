"""Builds public/data/ejercicios.json from two open exercise datasets.

1. https://github.com/yuhonas/free-exercise-db (dist/exercises.json), released
   into the public domain (Unlicense). Every exercise has two photos (start and
   end position), which the app shows as a two-frame demonstration. The photos
   are served from jsDelivr, pinned to the commit in app/lib/exercise-library.ts.
2. https://github.com/hasaneyldrm/exercises-dataset (data/exercises.json), MIT.
   Only its data is used (names, muscles, equipment, Spanish instructions). Its
   images and GIFs are (c) Gym visual and are NOT covered by that license, so
   they are deliberately left out.

Exercises found in both are merged: photos from the first, Spanish steps from
the second. Names stay in English (as coaches use them); `es` carries Spanish
keywords so that searching "sentadilla" finds every squat.

Usage: python3 scripts/build-exercise-library.py free-exercise-db.json exercises-dataset.json
"""
import json
import re
import sys

# --- exercises-dataset labels -------------------------------------------------
CATEGORY = {
    "upper arms": "Brazos", "lower arms": "Brazos", "upper legs": "Piernas",
    "lower legs": "Piernas", "back": "Espalda", "waist": "Core", "chest": "Pecho",
    "shoulders": "Hombros", "cardio": "Cardio", "neck": "Hombros",
}
EQUIPMENT = {
    "body weight": "Peso corporal", "dumbbell": "Mancuernas", "cable": "Polea",
    "barbell": "Barra", "leverage machine": "Máquina", "band": "Banda elástica",
    "smith machine": "Máquina", "kettlebell": "Kettlebell", "weighted": "Otro",
    "stability ball": "Fitball", "ez barbell": "Barra", "assisted": "Máquina",
    "sled machine": "Máquina", "medicine ball": "Balón medicinal", "rope": "Otro",
    "roller": "Foam roller", "resistance band": "Banda elástica", "bosu ball": "Otro",
    "olympic barbell": "Barra", "wheel roller": "Otro",
    "upper body ergometer": "Máquina", "skierg machine": "Máquina",
    "hammer": "Otro", "stationary bike": "Máquina", "tire": "Otro",
    "trap bar": "Barra", "elliptical machine": "Máquina", "stepmill machine": "Máquina",
}
TARGET = {
    "abs": "Abdominales", "pectorals": "Pectorales", "biceps": "Bíceps", "glutes": "Glúteos",
    "delts": "Deltoides", "triceps": "Tríceps", "upper back": "Espalda alta", "lats": "Dorsales",
    "calves": "Gemelos", "quads": "Cuádriceps", "forearms": "Antebrazos",
    "cardiovascular system": "Cardiovascular", "hamstrings": "Isquiotibiales",
    "spine": "Lumbares", "traps": "Trapecios", "adductors": "Aductores",
    "serratus anterior": "Pectorales", "abductors": "Abductores",
    "levator scapulae": "Trapecios",
}

# --- free-exercise-db labels --------------------------------------------------
# muscle -> (target, body area)
MUSCLE = {
    "abdominals": ("Abdominales", "Core"), "chest": ("Pectorales", "Pecho"),
    "biceps": ("Bíceps", "Brazos"), "glutes": ("Glúteos", "Piernas"),
    "shoulders": ("Deltoides", "Hombros"), "triceps": ("Tríceps", "Brazos"),
    "middle back": ("Espalda alta", "Espalda"), "lats": ("Dorsales", "Espalda"),
    "calves": ("Gemelos", "Piernas"), "quadriceps": ("Cuádriceps", "Piernas"),
    "forearms": ("Antebrazos", "Brazos"), "hamstrings": ("Isquiotibiales", "Piernas"),
    "lower back": ("Lumbares", "Espalda"), "traps": ("Trapecios", "Espalda"),
    "adductors": ("Aductores", "Piernas"), "abductors": ("Abductores", "Piernas"),
    "neck": ("Trapecios", "Hombros"),
}
FREE_EQUIPMENT = {
    "barbell": "Barra", "dumbbell": "Mancuernas", "other": "Otro", "body only": "Peso corporal",
    "cable": "Polea", None: "Peso corporal", "machine": "Máquina", "kettlebells": "Kettlebell",
    "bands": "Banda elástica", "medicine ball": "Balón medicinal", "exercise ball": "Fitball",
    "foam roll": "Foam roller", "e-z curl bar": "Barra",
}
LEVEL = {"beginner": "Principiante", "intermediate": "Intermedio", "expert": "Avanzado"}
KIND = {
    "strength": "fuerza", "powerlifting": "fuerza", "strongman": "fuerza",
    "stretching": "movilidad", "plyometrics": "pliometria",
    "olympic weightlifting": "halterofilia", "cardio": "cardio",
}

# English term -> Spanish keywords a coach would type. Longest terms first.
GLOSSARY = [
    ("bench press", "press banca"), ("chest press", "press pecho"), ("military press", "press militar"),
    ("shoulder press", "press hombros"), ("overhead press", "press militar"), ("leg press", "prensa piernas"),
    ("leg extension", "extension cuadriceps"), ("leg curl", "curl femoral"), ("leg raise", "elevacion piernas"),
    ("calf raise", "elevacion talones gemelos"), ("lateral raise", "elevacion lateral vuelos"),
    ("front raise", "elevacion frontal"), ("hip thrust", "empuje cadera"), ("glute bridge", "puente gluteos"),
    ("pull up", "dominada"), ("pull-up", "dominada"), ("pullup", "dominada"), ("chin up", "dominada supina"),
    ("chin-up", "dominada supina"), ("push up", "flexion brazos lagartija"), ("push-up", "flexion brazos lagartija"),
    ("pushup", "flexion brazos lagartija"), ("sit up", "abdominal"), ("sit-up", "abdominal"),
    ("pulldown", "jalon polea"), ("pull down", "jalon polea"), ("pushdown", "extension triceps polea"),
    ("jumping jack", "saltos tijera"), ("mountain climber", "escalador"), ("box jump", "salto cajon"),
    ("jump rope", "saltar cuerda"), ("farmer", "paseo granjero"), ("good morning", "buenos dias"),
    ("clean and jerk", "cargada envion dos tiempos"), ("kettlebell swing", "balanceo pesa rusa"),
    ("deadlift", "peso muerto"), ("squat", "sentadilla"), ("lunge", "zancada estocada"), ("row", "remo"),
    ("curl", "curl"), ("press", "press"), ("fly", "aperturas"), ("flye", "aperturas"),
    ("crunch", "abdominal encogimiento"), ("plank", "plancha"), ("dip", "fondos"), ("shrug", "encogimiento hombros"),
    ("raise", "elevacion"), ("extension", "extension"), ("kickback", "patada"), ("twist", "giro"),
    ("stretch", "estiramiento"), ("jump", "salto"), ("sprint", "carrera velocidad"), ("run", "correr trote"),
    ("snatch", "arrancada"), ("clean", "cargada"), ("jerk", "envion"), ("thruster", "thruster"),
    ("burpee", "burpee"), ("swing", "balanceo"), ("throw", "lanzamiento"), ("slam", "golpe balon"),
    ("step", "escalon"), ("bridge", "puente"), ("rotation", "rotacion"), ("hold", "isometrico"),
    ("walk", "caminata"), ("carry", "acarreo"), ("hop", "salto"), ("bound", "salto"), ("skip", "skipping"),
    ("barbell", "barra"), ("dumbbell", "mancuernas"), ("kettlebell", "pesa rusa"), ("cable", "polea"),
    ("band", "banda elastica"), ("machine", "maquina"), ("smith", "multipower"), ("bench", "banco"),
    ("ball", "balon"), ("rope", "cuerda"), ("incline", "inclinado"), ("decline", "declinado"),
    ("seated", "sentado"), ("standing", "de pie"), ("lying", "acostado tumbado"), ("kneeling", "de rodillas"),
    ("front", "frontal"), ("back", "trasera espalda"), ("rear", "posterior"), ("side", "lateral"),
    ("reverse", "inverso"), ("single", "unilateral"), ("one arm", "un brazo"), ("one leg", "una pierna"),
    ("alternate", "alterno"), ("wide", "abierto"), ("close", "cerrado"), ("narrow", "cerrado"),
    ("overhead", "sobre la cabeza"), ("hammer", "martillo"), ("preacher", "predicador scott"),
    ("romanian", "rumano"), ("sumo", "sumo"), ("goblet", "copa goblet"), ("split", "bulgara"),
    ("hip", "cadera"), ("shoulder", "hombro"), ("chest", "pecho"), ("leg", "pierna"), ("arm", "brazo"),
    ("triceps", "triceps"), ("biceps", "biceps"), ("calf", "gemelos"), ("glute", "gluteo"),
    ("hamstring", "isquiotibiales femoral"), ("quad", "cuadriceps"), ("neck", "cuello"), ("wrist", "muneca"),
    ("ankle", "tobillo"), ("knee", "rodilla"), ("abs", "abdominales"), ("ab", "abdominales"),
]


def keywords(name):
    """Spanish search keywords for an English exercise name."""
    text = " " + re.sub(r"[^a-z0-9\- ]", " ", name.lower()) + " "
    found = []
    for term, spanish in GLOSSARY:
        if re.search(r"[ \-]" + re.escape(term) + r"(s|es)?[ \-]", text):
            found += [word for word in spanish.split() if word not in found]
    return " ".join(found)


def match_key(name):
    """Order- and plural-insensitive key to recognise the same exercise in both datasets."""
    text = re.sub(r"\(.*?\)", "", name.lower())
    text = re.sub(r"[^a-z0-9 ]", " ", text)
    skip = {"the", "a", "with", "on", "of", "and", "to"}
    return " ".join(sorted(word.rstrip("s") for word in text.split() if word not in skip))


free = json.load(open(sys.argv[1], encoding="utf-8"))
spanish = json.load(open(sys.argv[2], encoding="utf-8"))

steps_by_key = {
    match_key(item["name"]): [s.strip() for s in item["instruction_steps"]["es"] if s.strip()]
    for item in spanish
}

library, used = [], set()
for item in free:
    key = match_key(item["name"])
    used.add(key)
    target, area = MUSCLE[item["primaryMuscles"][0]]
    kind = KIND[item["category"]]
    library.append({
        "id": item["id"],
        "name": item["name"].strip(),
        "es": keywords(item["name"]),
        "category": "Cardio" if kind == "cardio" else area,
        "equipment": FREE_EQUIPMENT[item["equipment"]],
        "target": target,
        "level": LEVEL[item["level"]],
        "kind": kind,
        "compound": item.get("mechanic") == "compound",
        "img": item["id"] if item.get("images") else "",
        "steps": steps_by_key.get(key, []),
    })

for item in spanish:
    if match_key(item["name"]) in used:
        continue
    name = item["name"].strip().title()
    category = CATEGORY[item["category"]]
    library.append({
        "id": "x" + item["id"],
        "name": name,
        "es": keywords(name),
        "category": category,
        "equipment": EQUIPMENT[item["equipment"]],
        "target": TARGET[item["target"]],
        "level": "Intermedio",
        "kind": "cardio" if category == "Cardio" else "movilidad" if "stretch" in name.lower() else "fuerza",
        "compound": False,
        "img": "",
        "steps": [s.strip() for s in item["instruction_steps"]["es"] if s.strip()],
    })

library.sort(key=lambda exercise: exercise["name"].lower())

assert len({exercise["id"] for exercise in library}) == len(library), "duplicate ids"
assert "sentadilla" in keywords("Barbell Front Squat") and "peso muerto" in keywords("Romanian Deadlifts")

out = "public/data/ejercicios.json"
json.dump(library, open(out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
with_photos = sum(1 for exercise in library if exercise["img"])
with_steps = sum(1 for exercise in library if exercise["steps"])
print(f"{len(library)} exercises ({with_photos} with photos, {with_steps} with Spanish steps) -> {out}")
