from fastapi import FastAPI, HTTPException, Header, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
from pydantic import BaseModel
from typing import List
import random
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Rand-A-Pizza API")

@app.middleware("http")
async def add_csp_header(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["Content-Security-Policy"] = "img-src 'self' https://*.supabase.co data: https:;"
    return response

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase setup (uses your existing env vars)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Pydantic models
class IngredientsRequest(BaseModel):
    num_ingredients: int = 5  # 1-10

class PizzaRecipe(BaseModel):
    user_id: str  # From frontend (localStorage UUID or session)
    ingredients: List[str]
    liked: bool = False  # True=thumbs up, False=thumbs down

@app.get("/api/ingredients")
def get_ingredients():
    data = supabase.table("ingreds").select("category,name").execute()
    toppings = [row["name"] for row in data.data if row["category"] == "toppings"]
    cheeses = [row["name"] for row in data.data if row["category"] == "cheeses"]
    doughs = [row["name"] for row in data.data if row["category"] == "doughs"]
    return {"toppings": toppings, "cheeses": cheeses, "doughs": doughs}


@app.post("/api/random-pizza")
def random_pizza(request: IngredientsRequest):
    ingredients = get_ingredients()
    if not 1 <= request.num_ingredients <= 10:
        raise HTTPException(400, "num_ingredients must be 1-10")
    selected = random.sample(ingredients, request.num_ingredients)
    return {"ingredients": selected}

@app.post("/api/save-recipe")
def save_recipe(recipe: PizzaRecipe):  # recipe.ingredients = ["mozzarella", "salami", "classic"]
    # Convert names → IDs
    all_ing = supabase.table("ingredients").select("id,name").execute()
    name_to_id = {row["name"]: row["id"] for row in all_ing.data}
    ids = [name_to_id[name] for name in recipe.ingredients if name in name_to_id]
    
    data, count = supabase.table("userdata").insert({
        "user_id": recipe.user_id,
        "ingredient_ids": ids,
        "liked": recipe.liked
    }).execute()
    return {"saved_ids": ids}

@app.get("/api/user-recipes/{user_id}")
def get_user_recipes(user_id: str):
    data = supabase.table("userdata").select("*").eq("user_id", user_id).execute()
    recipes = []
    for row in data.data:
        # Get names from IDs
        ids = row["ingredient_ids"]
        names = supabase.table("ingredients").select("name").in_("id", ids).execute()
        recipes.append({
            "ingredient_names": [n["name"] for n in names.data],
            "liked": row["liked"],
            "created_at": row["created_at"]
        })
    return recipes

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
