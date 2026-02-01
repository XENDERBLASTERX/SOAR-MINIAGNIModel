queue = []

def add(case_id):
    queue.append({"case_id": case_id, "approved": False})

def approve(case_id):
    for q in queue:
        if q["case_id"] == case_id:
            q["approved"] = True
            return True
    return False

def is_approved(case_id):
    for q in queue:
        if q["case_id"] == case_id:
            return q["approved"]
    return False
