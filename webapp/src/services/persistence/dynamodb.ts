import { ISODatetimeString, Task, TaskId } from "../../domain/types";
import {
  DynamoDBClient,
  CreateTableCommand,
  DeleteTableCommand,
  PutItemCommand,
  CreateTableCommandOutput,
  DeleteBackupCommandOutput,
  PutItemCommandOutput,
  GetItemCommandOutput,
  GetItemCommand,
  AttributeValue,
  DeleteItemCommand,
  DynamoDBClientConfig,
  BatchGetItemCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { Credentials } from "@aws-sdk/types/dist-types/credentials";

enum ATTRIBUTE_TYPE {
  string = "S",
  number = "N",
  binary = "B",
}

enum TableNames {
  tasks = "tasks",
  views = "views",
}

// Secondary index for the Tasks table
// purpose: efficiently retrieve Tasks updated after a given date
const TASK_INDEX = {
  name: "UpdatedAt",
  keys: {
    deleted: "deleted", //  0=False, 1=True
    epoch: "updated_at", // Unix timestamp, but in miliseconds instead of seconds
  },
};

enum Deleted {
  false = "0",
  true = "1",
}

export class DynamoDbClient {
  private client: DynamoDBClient;
  constructor({ region, endpoint }: DynamoDBClientConfig) {
    const accessKeyId = "X";
    const secretAccessKey = "X";
    const credentials: Credentials = { accessKeyId, secretAccessKey };
    console.log(credentials);
    this.client = new DynamoDBClient({
      region,
      endpoint,
      // apiVersion: "20",
      credentials,
    });
  }

  public async createTables(): Promise<CreateTableCommandOutput> {
    // https://www.dynamodbguide.com/querying#using-key-expressions
    const command = new CreateTableCommand({
      TableName: TableNames.tasks,
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: ATTRIBUTE_TYPE.string,
        },
        {
          AttributeName: TASK_INDEX.keys.epoch,
          AttributeType: ATTRIBUTE_TYPE.number,
        },
        {
          AttributeName: TASK_INDEX.keys.deleted,
          AttributeType: ATTRIBUTE_TYPE.number,
        },
      ],
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
      GlobalSecondaryIndexes: [
        {
          IndexName: TASK_INDEX.name,
          KeySchema: [
            // Secondary indexes must have a HASH key. A HASH key does not support `>`
            // or `>` operations
            { AttributeName: TASK_INDEX.keys.deleted, KeyType: "HASH" },
            // if you want to run `>` or `<` operations on a secondary index, you need
            // to add a RANGE key alongside with the HASH key. You cannot have a=
            // standalone RANGE key
            { AttributeName: TASK_INDEX.keys.epoch, KeyType: "RANGE" },
          ],
          Projection: { ProjectionType: "ALL" },
          /**
           * TODO: understand what is this? it's mandatory but I just copy-pasted
           * `Projection` probably affect to the performance of the query: look
           * for "Keep the size of your index as small as possible to improve
           * performance. This means choosing your projections carefully!" here:
           * https://medium.com/cloud-native-the-gathering/querying-dynamodb-by-date-range-899b751a6ef2
           */
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    });
    const result = await this.client.send(command);
    return result;
  }

  public async deleteTables(): Promise<DeleteBackupCommandOutput> {
    const command = new DeleteTableCommand({ TableName: TableNames.tasks });
    const result = await this.client.send(command);
    return result;
  }

  public async addTask(task: Task): Promise<PutItemCommandOutput> {
    const updated = new Date(task.updated);
    const epoch = dateToEpoch(updated);

    console.log(`Adding Task #${task.id} with epoch ${epoch}`);

    const command = new PutItemCommand({
      TableName: TableNames.tasks,
      Item: {
        id: { [ATTRIBUTE_TYPE.string]: task.id },
        title: { [ATTRIBUTE_TYPE.string]: task.title },
        content: { [ATTRIBUTE_TYPE.string]: task.content },
        updated: { [ATTRIBUTE_TYPE.string]: task.updated },
        created: { [ATTRIBUTE_TYPE.string]: task.created },
        tags: { [ATTRIBUTE_TYPE.string]: JSON.stringify([...task.tags]) },
        blocks: { [ATTRIBUTE_TYPE.string]: JSON.stringify([...task.blocks]) },
        blockedBy: {
          [ATTRIBUTE_TYPE.string]: JSON.stringify([...task.blockedBy]),
        },

        // Optimization: these keys are added for filtering purposes
        [TASK_INDEX.keys.epoch]: { [ATTRIBUTE_TYPE.number]: epoch },
        [TASK_INDEX.keys.deleted]: { [ATTRIBUTE_TYPE.number]: Deleted.false },
      },
    });
    const result = await this.client.send(command);
    return result;
  }

  public async getTaskById(taskId: TaskId): Promise<Task | undefined> {
    const command = new GetItemCommand({
      TableName: TableNames.tasks,
      Key: {
        id: { [ATTRIBUTE_TYPE.string]: taskId },
      },
    });
    const result = await this.client.send(command);

    if (result.$metadata.httpStatusCode !== 200) {
      console.debug(result);
      throw new Error(`${result}`);
    }

    const item = result.Item;

    if (item === undefined) return undefined;

    const task: Task = this.itemToTask(item);
    return task;
  }

  public async getTasksUpdatedAfter(date: Date): Promise<Task[]> {
    /**
     * TODO: add support for pagination
     *
     *     if "LastEvaluatedKey" in result:
     *         next_request = {
     *             ...  # other props
     *             "ExclusiveStartKey": result["LastEvaluatedKey"],
     *         }
     *     else:
     *         ... # no more items to fetch
     *
     * Pagination: 1MB or less
     * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html
     */

    console.debug(`Fetching tasks updated after ${date.toISOString()}`);
    console.debug(`updated_at       = ${dateToEpoch(date)}`);

    const command = new QueryCommand({
      TableName: TableNames.tasks,
      IndexName: TASK_INDEX.name,
      KeyConditionExpression: `deleted = :deleted AND ${TASK_INDEX.keys.epoch} >= :epoch`,
      ExpressionAttributeValues: {
        ":deleted": { [ATTRIBUTE_TYPE.number]: Deleted.false },
        ":epoch": { [ATTRIBUTE_TYPE.number]: dateToEpoch(date) },
      },
    });
    console.log(1);
    const result = await this.client.send(command);
    console.log(2);
    console.log(result);
    console.log(JSON.stringify(result.Items, null, 2));

    if (result.$metadata.httpStatusCode !== 200) {
      throw new Error(`${result}`);
    }

    const items = result.Items;

    if (items === undefined) return [];

    const tasks: Task[] = items.map(this.itemToTask);
    console.log(tasks);
    return tasks;
  }

  public async deleteTasks(task: Task): Promise<void> {
    // TODO: support batch deletion

    const command = new DeleteItemCommand({
      TableName: TableNames.tasks,
      Key: {
        id: { [ATTRIBUTE_TYPE.string]: task.id },
      },
    });
    const result = await this.client.send(command);
    console.log(result); // TODO: assert result.$metadata.httpStatusCode === 200
    return;
  }

  private itemToTask(item: Record<string, AttributeValue>): Task {
    function get(attr: AttributeValue): string {
      return attr[ATTRIBUTE_TYPE.string] as string;
    }
    const task = {
      id: get(item.id),
      title: get(item.title),
      content: get(item.content),
      updated: get(item.updated),
      created: get(item.created),
      tags: new Set(JSON.parse(get(item.tags))),
      blocks: new Set(JSON.parse(get(item.blocks))),
      blockedBy: new Set(JSON.parse(get(item.blockedBy))),
    } as Task;
    return task;
  }
}

function dateToEpoch(date: Date): string {
  const ms = date.valueOf();
  return `${ms}`;
}

interface getClientProps {
  url: string;
  region: string;
}
export function getClient({ url, region }: getClientProps): DynamoDbClient {
  return new DynamoDbClient({ endpoint: url, region });
}
