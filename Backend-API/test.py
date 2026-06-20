import requests
print("Current IP:", requests.get("https://api.ipify.org").text)