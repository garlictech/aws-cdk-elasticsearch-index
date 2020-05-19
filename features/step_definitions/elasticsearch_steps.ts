import { Before, Given, Then } from 'cucumber';
import { Client } from '@elastic/elasticsearch';
import { expect } from 'chai';

let esClient: Client;
const getESClient = (): Client => {
  if (esClient == null) {
    esClient = new Client({
      node: process.env.ELASTICSEARCH_ENDPOINT,
    });
  }

  return esClient;
};

const getIndicesWithPrefix = async (prefix: string): Promise<string[]> => {
  const indices = await getESClient().cat.indices();
  expect(indices.statusCode).to.be.equal(200);

  // @todo this regex should stop at the first whitespace but does not in javascript
  const matches = (indices.body as string).match(
    new RegExp(`${prefix}[^ ]*`, 'gm')
  );
  return matches ?? [];
};

const getIndicesWithPrefixAndNotId = async (
  prefix: string,
  id: string
): Promise<string[]> => {
  const indices = await getIndicesWithPrefix(prefix);
  return indices.filter((indexName: string) => !indexName.endsWith(id));
};

Before({ tags: '@clearElasticSearch' }, async () => {
  const indices = await getESClient().cat.indices({});
  const rows = indices.body.split(/\n/);
  for (const row of rows) {
    const index = row.split(/\s+/)[2];
    if (index && index.charAt(0) !== '.') {
      await getESClient().indices.delete({ index });
    }
  }
});

Given(
  /^an elasticsearch index with prefix "([^"]*)" and id "([^"]*)" exists with mapping:$/,
  async (prefixNameEnv: string, id: string, mapping: string) => {
    const existingIndexName = `${process.env[prefixNameEnv]}-${id}`;
    await getESClient().indices.create({
      index: existingIndexName,
      body: mapping,
    });
  }
);

Given(
  /^an elasticsearch index with prefix "([^"]*)" and id "([^"]*)" has this document indexed:$/,
  async (prefixNameEnv: string, id: string, mapping: string) => {
    const existingIndexName = `${process.env[prefixNameEnv]}-${id}`;
    await getESClient().index({
      index: existingIndexName,
      refresh: 'true',
      body: mapping,
    });
  }
);

Given(
  /^an elasticsearch index with prefix "([^"]*)" with id not "([^"]*)" has this document indexed:$/,
  async (prefixNameEnv: string, notId: string, mapping: string) => {
    const prefix = process.env[prefixNameEnv] as string;
    const [existingIndexName] = await getIndicesWithPrefixAndNotId(
      prefix,
      notId
    );

    await getESClient().index({
      index: existingIndexName,
      refresh: 'true',
      body: mapping,
    });
  }
);

Then(
  /^an elasticsearch index with prefix "([^"]*)" exists$/,
  async (prefixNameEnv: string) => {
    const prefix = process.env[prefixNameEnv] as string;
    const [indexName] = await getIndicesWithPrefix(prefix);
    // tslint:disable-next-line:no-unused-expression
    expect(indexName).to.not.be.undefined;
  }
);

Then(
  /^an elasticsearch index with prefix "([^"]*)" with id not "([^"]*)" exists$/,
  async (prefixNameEnv: string, notId: string) => {
    const prefix = process.env[prefixNameEnv] as string;
    const [indexName] = await getIndicesWithPrefixAndNotId(prefix, notId);
    // tslint:disable-next-line:no-unused-expression
    expect(indexName).to.not.be.undefined;
  }
);

Then(
  /^an elasticsearch index with prefix "([^"]*)" does not exist$/,
  async (prefixNameEnv: string) => {
    const prefix = process.env[prefixNameEnv] as string;
    const [indexName] = await getIndicesWithPrefix(prefix);
    // tslint:disable-next-line:no-unused-expression
    expect(indexName).to.be.undefined;
  }
);

Then(
  /^an elasticsearch index with prefix "([^"]*)" and id "([^"]*)" does not exist$/,
  async (prefixNameEnv: string, id: string) => {
    const prefix = process.env[prefixNameEnv] as string;
    const indexName = `${prefix}-${id}`;
    const indices = await getIndicesWithPrefix(prefix);
    // tslint:disable-next-line:no-unused-expression
    expect(indices).to.not.contain(indexName);
  }
);

Then(
  /^the elasticsearch index with prefix "([^"]*)" has mapping:$/,
  async (prefixNameEnv: string, expected: string) => {
    const prefix = process.env[prefixNameEnv] as string;
    const [indexName] = await getIndicesWithPrefix(prefix);

    const mapping = await getESClient().indices.getMapping({
      index: indexName as string,
    });

    expect(mapping.body[indexName].mappings).to.deep.equal(
      JSON.parse(expected)
    );
  }
);

Then(
  /^the elasticsearch index with prefix "([^"]*)" with id not "([^"]*)" has mapping:$/,
  async (prefixNameEnv: string, notId: string, expected: string) => {
    const prefix = process.env[prefixNameEnv] as string;
    const [indexName] = await getIndicesWithPrefixAndNotId(prefix, notId);

    const mapping = await getESClient().indices.getMapping({
      index: indexName as string,
    });

    expect(mapping.body[indexName].mappings).to.deep.equal(
      JSON.parse(expected)
    );
  }
);

Then(
  /^the elasticsearch index with prefix "([^"]*)" with id not "([^"]*)" has this document indexed:$/,
  async (prefixNameEnv: string, notId: string, expected: string) => {
    const prefix = process.env[prefixNameEnv] as string;
    const [indexName] = await getIndicesWithPrefixAndNotId(prefix, notId);

    const result = await getESClient().search({
      index: indexName,
      body: { query: { match: JSON.parse(expected) } },
    });

    expect(result.body.hits.total.value).to.equal(1);
  }
);
