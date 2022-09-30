#!/usr/bin/env bash

# aws dynamodb query help
# aws dynamodb query

# aws dynamodb scan --table-name "tasks" --endpoint-url http://localhost:8000 --region localhost
# exit

# "1663495200000"
# "1663498800000"
# "1663502400000"

# WORKED - the "AND" keyword is case insensitive
aws dynamodb query --table-name "tasks" --endpoint-url http://localhost:8000 --region localhost \
    --index-name "UpdatedAt" \
    --key-condition-expression "updated_at > :epoch and updated_at_month = :month" \
    --expression-attribute-values '{":month":{"S":"2022-09"},":epoch":{"N":"1663498800000"}}'
exit

# WORKED - the order is not relevant
aws dynamodb query --table-name "tasks" --endpoint-url http://localhost:8000 --region localhost \
    --index-name "UpdatedAt" \
    --key-condition-expression "updated_at = :epoch AND updated_at_month = :month" \
    --expression-attribute-values '{":month":{"S":"2022-09"},":epoch":{"N":"1663498800000"}}'
exit

# WORKED
aws dynamodb query --table-name "tasks" --endpoint-url http://localhost:8000 --region localhost \
    --index-name "UpdatedAt" \
    --key-condition-expression "updated_at_month = :month AND updated_at = :epoch" \
    --expression-attribute-values '{":month":{"S":"2022-09"},":epoch":{"N":"1663498800000"}}'
exit


# WORKED!
aws dynamodb query --table-name "tasks" --endpoint-url http://localhost:8000 --region localhost \
    --index-name "UpdatedAt" \
    --key-condition-expression "updated_at_month = :month" \
    --expression-attribute-values '{":month":{"S":"2022-09"}}'
exit

aws dynamodb query --table-name "tasks" --endpoint-url http://localhost:8000 --region localhost \
    --index-name "UpdatedAt" \
    --key-condition-expression "updated_at_month = :m AND updated_at >= :t" \
    --expression-attribute-values '{":m":{"S":""},":t":{"S":""}}'

exit

aws dynamodb \
    describe-table \
        --table-name tasks \
        --endpoint-url http://localhost:8000 \
        --region localhost
# {
#     "Table": {
#         "AttributeDefinitions": [
#             {
#                 "AttributeName": "id",
#                 "AttributeType": "S"
#             },
#             {
#                 "AttributeName": "updated_at",
#                 "AttributeType": "N"
#             },
#             {
#                 "AttributeName": "updated_at_month",
#                 "AttributeType": "S"
#             }
#         ],
#         "TableName": "tasks",
#         "KeySchema": [
#             {
#                 "AttributeName": "id",
#                 "KeyType": "HASH"
#             }
#         ],
#         "TableStatus": "ACTIVE",
#         "CreationDateTime": "2022-09-30T17:48:38.589000+01:00",
#         "ProvisionedThroughput": {
#             "LastIncreaseDateTime": "1970-01-01T00:00:00+00:00",
#             "LastDecreaseDateTime": "1970-01-01T00:00:00+00:00",
#             "NumberOfDecreasesToday": 0,
#             "ReadCapacityUnits": 1,
#             "WriteCapacityUnits": 1
#         },
#         "TableSizeBytes": 474,
#         "ItemCount": 3,
#         "TableArn": "arn:aws:dynamodb:ddblocal:000000000000:table/tasks",
#         "GlobalSecondaryIndexes": [
#             {
#                 "IndexName": "UpdatedAt",
#                 "KeySchema": [
#                     {
#                         "AttributeName": "updated_at_month",
#                         "KeyType": "HASH"
#                     },
#                     {
#                         "AttributeName": "updated_at",
#                         "KeyType": "RANGE"
#                     }
#                 ],
#                 "Projection": {
#                     "ProjectionType": "ALL"
#                 },
#                 "IndexStatus": "ACTIVE",
#                 "ProvisionedThroughput": {
#                     "ReadCapacityUnits": 1,
#                     "WriteCapacityUnits": 1
#                 },
#                 "IndexSizeBytes": 474,
#                 "ItemCount": 3,
#                 "IndexArn": "arn:aws:dynamodb:ddblocal:000000000000:table/tasks/index/UpdatedAt"
#             }
#         ]
#     }
# }
