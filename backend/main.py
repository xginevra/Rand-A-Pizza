from fastapi import FastAPI, HTTPException, Header, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
from pydantic import BaseModel
from typing import List
import random
from dotenv import load_dotenv

app = FastAPI()

load_dotenv()

@app.middleware("http")
async def add_csp_header(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "img-src 'self' https://*.supabase.co data: https:; "
        "style-src 'self' 'unsafe-inline'; "
        "script-src 'self' 'unsafe-inline'; "
        "connect-src 'self' https://*.supabase.co;"
    )
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
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Debug output
print(f"DEBUG - SUPABASE_URL: '{SUPABASE_URL}'")
print(f"DEBUG - SUPABASE_KEY length: {len(SUPABASE_KEY)}")

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
    ingredients_data = get_ingredients()
    
    # Combine all ingredient types
    all_ingredients = (
        ingredients_data["toppings"] + 
        ingredients_data["cheeses"] + 
        ingredients_data["doughs"]
    )
    
    if not 1 <= request.num_ingredients <= 10:
        raise HTTPException(400, "num_ingredients must be 1-10")
    
    # Ensure we don't try to sample more than available
    num_to_select = min(request.num_ingredients, len(all_ingredients))
    selected = random.sample(all_ingredients, num_to_select)
    
    return {"ingreds": selected}


@app.post("/api/save-recipe")
def save_recipe(recipe: PizzaRecipe):
    # Convert names → IDs
    all_ing = supabase.table("ingreds").select("id,name").execute()
    name_to_id = {row["name"]: row["id"] for row in all_ing.data}
    
    ids = []
    missing = []
    for name in recipe.ingredients:
        if name in name_to_id:
            ids.append(name_to_id[name])
        else:
            missing.append(name)
    
    if missing:
        raise HTTPException(400, f"Unknown ingredients: {missing}")
    
    result = supabase.table("userdata").insert({
        "user_id": recipe.user_id,
        "ingredient_ids": ids,
        "liked": recipe.liked
    }).execute()
    
    return {"saved_ids": ids, "saved_count": len(ids)}

@app.get("/api/user-recipes/{user_id}")
def get_user_recipes(user_id: str):
    data = supabase.table("userdata").select("*").eq("user_id", user_id).execute()
    recipes = []
    for row in data.data:
        # Get names from IDs
        ids = row["ingredient_ids"]
        names = supabase.table("ingreds").select("name").in_("id", ids).execute()
        recipes.append({
            "ingredient_names": [n["name"] for n in names.data],
            "liked": row["liked"],
            "created_at": row["created_at"]
        })
    return recipes

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
