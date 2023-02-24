import {
  CreateTableCommand,
  GetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import {unmarshall} from '@aws-sdk/util-dynamodb';

import {client} from './client';

const TableName = 'class-user-feedback';

export interface ClassUserFeedback {
  userEmail: string;
  classId: string;
  rating: number;
  comment?: string;
}

export async function getFeedback(userEmail: string) {
  const command = new GetItemCommand({
    TableName,
    Key: {
      userEmail: {S: userEmail},
    },
  });
  const data = await client.send(command);
  if (data.Item) {
    return unmarshall(data.Item) as ClassUserFeedback;
  }
}

export async function createFeedback(cuf: ClassUserFeedback) {
  const item = {
    userEmail: {S: cuf.userEmail},
    classId: {S: cuf.classId},
    rating: {N: String(cuf.rating)},
  };
  if (cuf.comment) {
    Object.assign(item, {
      comment: {S: cuf.comment},
    });
  }
  const command = new PutItemCommand({
    TableName,
    Item: item,
  });
  const data = await client.send(command);
  if (data.Attributes) {
    return unmarshall(data.Attributes) as ClassUserFeedback;
  }
}

export async function createTable() {
  const command = new CreateTableCommand({
    TableName,
    AttributeDefinitions: [{AttributeName: 'userEmail', AttributeType: 'S'}],
    KeySchema: [{AttributeName: 'userEmail', KeyType: 'HASH'}],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  });
  return client.send(command);
}
