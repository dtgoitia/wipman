import {
  DynamoDBClient,
  BatchExecuteStatementCommand,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: "localhost",
  endpoint: "http://localhost:8000",
});

// const params = {
//   /** input parameters */
// };
// const command = new BatchExecuteStatementCommand(params);
class DynamoDbClient {
  constructor() {}
  public do(): void {
    //...
  }
}

const dynamoDbClient = new DynamoDbClient();
export default dynamoDbClient;
