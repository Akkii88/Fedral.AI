import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    # 1. Check Root
    try:
        r = requests.get(f"{BASE_URL}/")
        print("Root Status:", r.status_code, r.json())
    except Exception as e:
        print("Root check failed:", e)
        return

    # 2. Add Hospital
    hospital_data = {
        "name": "Test Hospital Alpha",
        "type": "Clinic",
        "location": "Test City",
        "contact_email": "admin@alpha.com"
    }
    r = requests.post(f"{BASE_URL}/api/hospitals/", json=hospital_data)
    print("Add Hospital:", r.status_code)
    if r.status_code == 200:
        h_id = r.json()['id']
        print(" -> Created ID:", h_id)
        
        # 3. List Hospitals
        r = requests.get(f"{BASE_URL}/api/hospitals/")
        print("List Hospitals:", r.status_code, len(r.json()))
        
        # 4. Get Hospital
        r = requests.get(f"{BASE_URL}/api/hospitals/{h_id}")
        print("Get Hospital:", r.status_code, r.json()['name'])
        
        # 5. Delete Hospital
        r = requests.delete(f"{BASE_URL}/api/hospitals/{h_id}")
        print("Delete Hospital:", r.status_code)

    # 6. Check Audit Logs
    r = requests.get(f"{BASE_URL}/api/admin/audit_logs")
    print("Audit Logs:", r.status_code, len(r.json()))

if __name__ == "__main__":
    test_api()
