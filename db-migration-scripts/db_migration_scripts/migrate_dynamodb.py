import os
from dataclasses import dataclass

import boto3

# TODO: move DB url to environment variable
dynamodb = boto3.resource(
    "dynamodb",
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    region_name=os.environ["AWS_REGION"],
    endpoint_url="http://127.0.0.1:8000",
)

TASK_TABLE_NAME = "tasks"


@dataclass(frozen=True)
class Task:
    id: str
    title: str
    content: str
    updated: str
    created: str
    tags: list[str]  # TODO: this must be a set
    blocks: list[str]  # TODO: this must be a set
    blockedBy: list[str]  # TODO: this must be a set


def create_task_table(dynamodb):
    table = dynamodb.create_table(
        TableName=TASK_TABLE_NAME,
        AttributeDefinitions=[
            {
                "AttributeName": "id",
                "AttributeType": "S",
            },
            {
                "AttributeName": "updated_at_month",
                "AttributeType": "N",
            },
            {
                "AttributeName": "updated_at",
                "AttributeType": "S",
            },
        ],
        KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
        GlobalSecondaryIndexes=[
            {
                "IndexName": "UpdatedAt",
                "KeySchema": [
                    {"AttributeName": "updated_at", "KeyType": "HASH"},
                    {"AttributeName": "updated_at_month", "KeyType": "RANGE"},
                ],
                "Projection": {"ProjectionType": "ALL"},
                "ProvisionedThroughput": {
                    "ReadCapacityUnits": 1,
                    "WriteCapacityUnits": 1,
                },
            },
        ],
        ProvisionedThroughput={
            "ReadCapacityUnits": 1,
            "WriteCapacityUnits": 1,
        },
    )
    return table


def add_task(task: Task):
    result = tasks_table.put_item(
        Item={
            "id": task.id,
            "title": task.title,
            "content": task.content,
            "updated": task.updated,
            "created": task.created,
            "tags": task.tags,
            "blocks": task.blocks,
            "blockedBy": task.blockedBy,
        }
    )
    return result


matching_results = [
    result for result in dynamodb.tables.all() if result.table_name == TASK_TABLE_NAME
]
if matching_results:
    tasks_table = matching_results[0]
else:
    tasks_table = create_task_table(dynamodb=dynamodb)


task_a = Task(
    id="93f0a30c-2d71-4c7b-9fc2-21fb23f56252",
    title="task A",
    content="content of task A",
    updated="2022-09-27 08:48:19Z",
    created="2022-09-27 08:48:19Z",
    tags=[],
    blocks=[],
    blockedBy=[],
)
task_b = Task(
    id="0aaa3d0d-589b-4baf-a17d-1d8674f08d4c",
    title="task B",
    content="content of task B",
    updated="2022-01-01 00:00:00Z",
    created="2022-01-01 00:00:00Z",
    tags=[],
    blocks=[],
    blockedBy=[],
)

result_a = add_task(task=task_a)
result_b = add_task(task=task_b)

# You need to:
#   Terminal 1: make run-db
#   Terminal 2: make migrate-db
#   Terminal 3: cd webapp; npm start
#   Browser: dev tools, see error when loading tasks from DB
#
# PROBLEMS:
# 1. after creating table with Python, the webapp cannot fetch tasks from DB - I suspect
#    that the indexes are not correctly used in Python either
#       on table creation or
#       when adding items to the DB
#
# 2. for some reason, whenI run the migration script in a container, the script cannot find the DB URl :S
# Have a look to this post, I think it uses secondary indexes to query in Python
# https://www.section.io/engineering-education/python-boto3-and-amazon-dynamodb-programming-tutorial/
# Query an item by Seconday Index
# https://aws.amazon.com/getting-started/hands-on/create-manage-nonrelational-database-dynamodb/module-3/

os.environ["PYTHONBREAKPOINT"] = "ipdb.set_trace"
breakpoint()

print()
