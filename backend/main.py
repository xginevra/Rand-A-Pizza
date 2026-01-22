from fastapi import FastAPI, HTTPException, Header, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
from pydantic import BaseModel
from typing import List, Optional
from fastapi import Depends
import time
import random
from dotenv import load_dotenv
from collections import Counter

app = FastAPI(title="Rand-A-Pizza API")

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

class UserCredentials(BaseModel):
    email: str
    password: str

class ProfileData(BaseModel):
    email: Optional[str] = None
    company: Optional[str] = None
    
    # Add other profile fields as needed

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization[7:]
    user = supabase.auth.get_user(token)
    if user.user is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user.user

@app.post("/api/register")
def register_user(user: UserCredentials, request: Request):
    try:
        host = request.headers.get("x-forwarded-host") or request.headers.get("X-Frontend-URL") or request.headers.get("host") or "localhost:3000"
        scheme = request.headers.get("x-forwarded-proto", "http")
        base_url = f"{scheme}://{host}"
        redirect_url = f"{base_url}/emailconfirmed"

        result = supabase.auth.sign_up(
            {
                "email": user.email,
                "password": user.password,
                "options": {
                    "email_redirect_to": redirect_url
                }
            }
        )
        if result.user is None:
            raise HTTPException(status_code=400, detail="Registration failed")
        return {"message": "User registered", "id": result.user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/login")
def login_user(user: UserCredentials):
    try:
        result = supabase.auth.sign_in_with_password({"email": user.email, "password": user.password})
        if result.session is None:
            raise HTTPException(status_code=401, detail="Login failed")
        return {"access_token": result.session.access_token}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/api/profile")
def get_profile(user=Depends(get_current_user)):
    uid = user.id
    response = supabase.table("userdata").select("*").eq("user_id", uid).maybe_single().execute()
    data = getattr(response, "data", None)

    if not data:
        placeholder = {
            "user_id": uid,
            "email": user.email,
            "company": "Please fill in your company",
        }
        supabase.table("userdata").insert(placeholder).execute()
        time.sleep(1)
        response = supabase.table("userdata").select("*").eq("user_id", uid).maybe_single().execute()
        data = getattr(response, "data", None)

    return data

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
    
@app.get("/api/business/stats")
def get_dashboard_stats(user=Depends(get_current_user)):
    response = supabase.table("pizza_recipes").select("*").execute()
    recipes = response.data

    if not recipes:
        return {"total_pizzas": 0, "top_toppings": [], "vote_distribution": []}

    # 2. Aggregate Data
    total_pizzas = len(recipes)
    total_votes = sum(r.get('votes', 0) for r in recipes)

    topping_counter = Counter()
    for r in recipes:
        toppings = r.get("toppings", [])
        if isinstance(toppings, list):
            for t in toppings:
                name = t.get("name") if isinstance(t, dict) else t
                if name:
                    topping_counter[name] += 1

    top_toppings = [{"name": k, "count": v} for k, v in topping_counter.most_common(5)]

    sorted_by_votes = sorted(recipes, key=lambda x: x.get("votes", 0), reverse=True)[:5]
    vote_distribution = [
        {"name": r.get("name", f"Pizza #{r.get('id')}"), "votes": r.get("votes", 0)} 
        for r in sorted_by_votes
    ]

    return {
        "total_pizzas": total_pizzas,
        "total_votes": total_votes,
        "top_toppings": top_toppings,
        "vote_distribution": vote_distribution
    }
