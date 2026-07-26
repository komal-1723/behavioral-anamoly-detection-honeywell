import uvicorn

if __name__ == "__main__":
    print("=========================================================================")
    print(" Launching AEGIS-UEBA AI Behavioral Anomaly Detection Server (FastAPI)...")
    print("=========================================================================")
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
