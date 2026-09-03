import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from dotenv import load_dotenv

# --- NEW LANGCHAIN 1.0+ IMPORTS ---
from langchain.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_agent

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="WeatherGPT API")

# --- 1. LLM Tools Definitions ---
@tool
def get_nwp_forecast(latitude: float, longitude: float) -> str:
    """Fetches real-time numerical weather prediction (NWP) data from Open-Meteo for a given location."""
    url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&daily=temperature_2m_max,precipitation_sum&timezone=auto"
    try:
        response = requests.get(url).json()
        rain_3_days = sum(response['daily']['precipitation_sum'][:3])
        return f"Total expected rainfall over next 3 days: {rain_3_days}mm. Max Temp: {response['daily']['temperature_2m_max'][0]}°C."
    except Exception as e:
        return "Weather API unavailable."

@tool
def generate_agricultural_advisory(rain_mm: float, crop: str) -> str:
    """Generates farming rules based on precipitation and crop type."""
    if rain_mm > 15.0 and crop.lower() == "wheat":
        return "CRITICAL ADVISORY: Halt harvesting immediately. High risk of crop rot."
    return "Weather is clear. Safe to continue standard farming operations."

# --- 2. AI Initialization ---
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.3)
tools = [get_nwp_forecast, generate_agricultural_advisory]

# LangChain 1.0+ replaces AgentExecutor entirely with create_agent
agent = create_agent(model=llm, tools=tools)

# --- 3. API Schemas ---
class ChatRequest(BaseModel):
    user_query: str
    latitude: float
    longitude: float
    language: str = "en"

class MeshAlertRequest(BaseModel):
    mesh_node_id: str
    battery_level: int
    alert_payload: str

# --- 4. API Endpoints ---
@app.get("/")
async def root():
    return {"message": "WeatherGPT API is successfully running!"}

@app.post("/api/chat")
async def chat_with_weathergpt(req: ChatRequest):
    try:
        query_input = f"User is at GPS: {req.latitude}, {req.longitude}. Query: '{req.user_query}'"
        
        # Modern Agent Invocation passes a simple list of dictionary messages
        response = agent.invoke({
            "messages": [
                {"role": "system", "content": "You are WeatherGPT, a helpful assistant. Use your tools to answer weather and agricultural questions."},
                {"role": "user", "content": query_input}
            ]
        })
        
        # The final answer is automatically stored in the content of the last message returned
        final_answer = response["messages"][-1].content
        
        return {"status": "success", "response": final_answer, "audio_tts_url": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/mesh/simulate")
async def simulate_mesh_routing(req: MeshAlertRequest):
    if req.battery_level < 20:
        action = "DROP_PACKET_SAVE_BATTERY"
        status = "Leaf Node: Alert received locally, but forwarding blocked to save battery."
    elif req.battery_level < 70:
        action = "STANDARD_RELAY"
        status = "Standard Node: Packet broadcasted to next hop."
    else:
        action = "SUPER_COURIER"
        status = "Super Node: Packet cached for Store-and-Forward aggressive broadcasting."
        
    return {
        "node_id": req.mesh_node_id,
        "routing_action": action,
        "system_status": status,
        "message_decrypted": req.alert_payload
    }