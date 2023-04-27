import requests

host = "128.140.50.206"
# host = "localhost"
port = 5000
base_url = f"http://{host}:{port}"

url = f"{base_url}/health"
print(f"GET {url}")
response = requests.get(url=url)

print(response)
print(response.json())
