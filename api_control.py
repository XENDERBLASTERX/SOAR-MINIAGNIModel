from fastapi import APIRouter
import config
import os
import re

router = APIRouter()

@router.get("/mode")
def get_mode():
    return {"mode": config.RESPONSE_MODE}

@router.post("/mode")
def set_mode(mode: str):
    if mode not in ["AUTO", "SEMI", "MANUAL"]:
        return {"error": "Invalid mode"}
    
    # Update in-memory config
    config.RESPONSE_MODE = mode
    
    # Persist to config.py file
    try:
        config_path = os.path.join(os.path.dirname(__file__), 'config.py')
        
        # Read current config file
        with open(config_path, 'r') as f:
            content = f.read()
        
        # Replace RESPONSE_MODE line
        updated_content = re.sub(
            r'RESPONSE_MODE\s*=\s*"[A-Z]+"',
            f'RESPONSE_MODE = "{mode}"',
            content
        )
        
        # Write back to file
        with open(config_path, 'w') as f:
            f.write(updated_content)
        
        print(f"[API] SOAR mode changed to {mode} and persisted to config.py")
        return {"message": f"SOAR mode set to {mode}", "persisted": True}
    
    except Exception as e:
        print(f"[API ERROR] Failed to persist mode to config.py: {e}")
        return {"message": f"SOAR mode set to {mode} (in-memory only)", "persisted": False, "error": str(e)}
