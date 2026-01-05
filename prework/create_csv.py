import csv
import json
import random
import sys

# Fix encoding for Windows
sys.stdout.reconfigure(encoding='utf-8')

# Your table data - NAMES ONLY
data = {
    "Toppings": [
        "Salami", "Ham", "Tuna", "Mozzarella", "Onions", "Mushrooms", 
        "Pineapple", "Peppers", "Garlic", "Döner", "Gyros", "Sucuk"
    ],
    "Cheeses": [
        "Mozzarella", "Gouda", "Emmentaler", "Edamer"
    ],
    "Doughs": [
        "Classic Wheat", "Roman", "Neapolitan", "American/Flammkuchen"
    ]
}

print("Generating clean CSV files (names only)...")

# 1. ingreds.csv
with open("randapizza_ingreds.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["toppings", "cheeses", "doughs"])
    writer.writerow([
        json.dumps(data["Toppings"]),
        json.dumps(data["Cheeses"]),
        json.dumps(data["Doughs"])
    ])

print("randapizza_ingreds.csv created")

# 2. userdata.csv 
all_ingreds = data["Toppings"] + data["Cheeses"] + data["Doughs"]
with open("randapizza_userdata.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["id", "ingredients", "liked", "created_at"])
    
    for i in range(100):
        user_id = f"user_{random.randint(1, 20)}"
        ingredients = random.sample(all_ingreds, random.randint(4, 10))
        liked = random.choice([True, False])
        created_at = "2026-01-05 11:00:00"
        writer.writerow([user_id, json.dumps(ingredients), liked, created_at])

print("randapizza_userdata.csv created (100 recipes)")

print("\nSUPABASE IMPORT:")
print("1. Table 'ingreds': toppings jsonb | cheeses jsonb | doughs jsonb")
print("2. Import randapizza_ingreds.csv")
print("3. Table 'userdata': id text | ingredients jsonb | liked boolean | created_at timestamptz")
print("4. Import randapizza_userdata.csv")

print("\nReady for your pizza app!")