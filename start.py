import os
import sys
import subprocess
import time

def run():
    print("Starting FoodRescue Platform (FastAPI + React)...")
    
    # 1. Install Backend Deps
    backend_req = os.path.join("backend", "requirements.txt")
    print("Installing Backend dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", backend_req])
    
    # 2. Install Frontend Deps
    print("Installing Frontend dependencies...")
    subprocess.check_call(["npm", "install"], cwd="frontend", shell=True)
    
    # 3. Start Backend in background
    print("Starting FastAPI backend on http://localhost:3000...")
    backend_process = subprocess.Popen(
        ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "3000"],
        shell=True
    )
    
    # 4. Start Frontend
    print("Starting Vite frontend on http://localhost:5173...")
    print("   (Proxying /api to http://localhost:3000)")
    try:
        subprocess.run(["npm", "run", "dev"], cwd="frontend", shell=True)
    except KeyboardInterrupt:
        print("\nStopping services...")
        backend_process.terminate()

if __name__ == "__main__":
    run()
