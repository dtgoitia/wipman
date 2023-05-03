import requests

USE_LOCAL = False
USE_LOCAL = True
if USE_LOCAL:
    api_url = "http://localhost:5000"
else:
    api_url = "https://api.dtgoitia.dev"


def check_health() -> None:
    url = f"{api_url}/health"
    print(f"GET {url}")
    response = requests.get(url=url)

    response.raise_for_status()
    print(response.json())


check_health()


# url = f"{api_url}/task"
# print(f"POST {url}")
# response = requests.post(
#     url=url,
#     json={
#         "task": {
#             "id": "9740a3fd52",
#             "title": "adasdasdddas",
#             "content": "",
#             "created": "2023-05-02T05:27:38.397Z",
#             "updated": "2023-05-02T05:27:38.397Z",
#             "tags": "",
#             "blocked_by": "",
#             "blocks": "",
#             "completed": False,
#         }
#     },
# )


# print(response)
# print(response.json())
