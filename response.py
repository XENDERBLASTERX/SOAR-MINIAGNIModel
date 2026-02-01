import subprocess

def block_ip(ip):
    subprocess.run(["iptables", "-I", "INPUT", "-s", ip, "-j", "DROP"])

def lock_user(user):
    subprocess.run(["passwd", "-l", user])

def revoke_sessions(user):
    subprocess.run(["pkill", "-u", user])
