import { ISODatetimeString, Task, TaskId } from "../../domain/types";
import { createTask } from "../../testHelpers";
import { errorsService } from "../errors";
import {
  DynamoDBClient,
  BatchExecuteStatementCommand,
  ListTablesCommand,
  CreateTableCommand,
  DeleteTableCommand,
  PutItemCommand,
  CreateTableCommandOutput,
  DeleteBackupCommandOutput,
  PutItemCommandOutput,
  GetItemCommandOutput,
  GetItemCommand,
  DeleteItemCommandOutput,
  AttributeValue,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: "localhost",
  endpoint: "http://localhost:8000",
});

enum ATTRIBUTE_TYPE {
  string = "S",
  number = "N",
  binary = "B",
}

enum TableNames {
  tasks = "tasks",
  views = "views",
}

class DynamoDbClient {
  private client: DynamoDBClient;
  constructor() {
    this.client = new DynamoDBClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });
  }

  public async createTables(): Promise<CreateTableCommandOutput> {
    const command = new CreateTableCommand({
      TableName: TableNames.tasks,
      AttributeDefinitions: [
        { AttributeName: "id", AttributeType: ATTRIBUTE_TYPE.string },
        // { AttributeName: "updated_at", AttributeType: ATTRIBUTE_TYPE.number },
      ],
      KeySchema: [
        { AttributeName: "id", KeyType: "HASH" },
        // { AttributeName: "updated_at", KeyType: "RANGE" },
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

        // Optimization: this key is added for filtering purposes
        updated_at: {
          [ATTRIBUTE_TYPE.number]: `${isoDateStringToNumber(task.updated)}`,
        },
      },
    });
    const result = await this.client.send(command);
    return result;
  }

  public async getTaskById(taskId: TaskId): Promise<Task | undefined> {
    const command = new GetItemCommand({
      TableName: TableNames.tasks,
      Key: {
        // TODO: change the ID to see what is returned when the ID is not found
        id: { [ATTRIBUTE_TYPE.string]: taskId },
      },
    });
    const result = await this.client.send(command);

    if (result.$metadata.httpStatusCode !== 200) {
      throw new Error(`${result}`);
    }

    if (result.Item === undefined) {
      return undefined;
    }

    const task: Task = this.itemToTask(result.Item);
    return task;
  }

  public async getTasksUpdatedAfter(date: Date): Promise<GetItemCommandOutput> {
    throw new Error("TODO");
  }

  public async deleteTasks(taskId: TaskId): Promise<void> {
    // TODO: support batch deletion

    const command = new DeleteItemCommand({
      TableName: TableNames.tasks,
      Key: { id: { [ATTRIBUTE_TYPE.string]: taskId } },
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

function isoDateStringToNumber(dateString: ISODatetimeString): number {
  const date = new Date(dateString);
  const ms = date.valueOf();
  return ms;
}

describe("DynamoDB", () => {
  let db: DynamoDbClient;

  beforeAll(async () => {
    db = new DynamoDbClient();
    const result = await db.createTables();
    expect(result.$metadata.httpStatusCode).toEqual(200);
  });

  afterAll(async () => {
    const result = await db.deleteTables();
    expect(result.$metadata.httpStatusCode).toEqual(200);
  });

  it("create, retrieve and delete a single task", async () => {
    const task = createTask();
    const result = await db.addTask(task);
    expect(result.$metadata.httpStatusCode).toEqual(200);

    const retrieved = await db.getTaskById(task.id);
    expect(retrieved).toEqual(task);

    await db.deleteTasks(task.id);

    const deleted = await db.getTaskById(task.id);
    expect(deleted).toEqual(undefined);
  });
});
