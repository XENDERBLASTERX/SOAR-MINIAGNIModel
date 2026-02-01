from fastapi import APIRouter
from approval_queue import approve
from response import block_ip
from case_manager import close_case

router = APIRouter()

@router.post("/{case_id}/approve")
def approve_case(case_id: str, ip: str):
    approve(case_id)
    block_ip(ip)
    close_case(case_id)
    return {"message": "Approved and remediated"}
