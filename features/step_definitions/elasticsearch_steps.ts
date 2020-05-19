import { Before, Given, Then } from 'cucumber';
import { Client } from '@elastic/elasticsearch';
import { expect } from 'chai';

let esClient: Client;

function getESClient(): Client {
  if (esClient == null) {
    esClient = new Client({
      node: process.env.ELASTICSEARCH_ENDPOINT,
    });
  }

  return esClient;
}

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
    const [existingIndexName] = (await getESClient().cat.indices()).body
      .filter((indexName: string) =>
        indexName.startsWith(process.env[prefixNameEnv] as string)
      )
      .filter((indexName: string) => !indexName.endsWith(notId));

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
    const indices = await getESClient().cat.indices();

    // tslint:disable-next-line:no-unused-expression
    expect(indices.body).to.contain(process.env[prefixNameEnv]);
    expect(indices.statusCode).to.be.equal(200);

    // @todo this regex should stop at the first whitespace but does not in javascript
    const matches = (indices.body as string).match(
      new RegExp(`${process.env[prefixNameEnv]}[^ ]*`, 'gm')
    );

    const [indexName] = matches ?? [];
    // tslint:disable-next-line:no-unused-expression
    expect(indexName).to.not.be.empty;
  }
);

Then(
  /^an elasticsearch index with prefix "([^"]*)" with id not "([^"]*)" exists$/,
  async (prefixNameEnv: string, notId: string) => {
    const indices = await getESClient().cat.indices();

    // tslint:disable-next-line:no-unused-expression
    expect(indices.body).to.contain(process.env[prefixNameEnv]);
    expect(indices.statusCode).to.be.equal(200);

    // @todo this regex should stop at the first whitespace but does not in javascript
    const matches = (indices.body as string).match(
      new RegExp(`${process.env[prefixNameEnv]}[^ ]*`, 'gm')
    );

    const [indexName] = (matches ?? []).filter(
      (indexName: string) => !indexName.endsWith(notId)
    );
    // tslint:disable-next-line:no-unused-expression
    expect(indexName).to.not.be.empty;
  }
);

Then(
  /^an elasticsearch index with prefix "([^"]*)" does not exist$/,
  async (prefixNameEnv: string) => {
    const indices = await getESClient().cat.indices();
    // tslint:disable-next-line:no-unused-expression
    expect(indices.body).to.not.contain(process.env[prefixNameEnv]);
  }
);

Then(
  /^an elasticsearch index with prefix "([^"]*)" and id "([^"]*)" does not exist$/,
  async (prefixNameEnv: string, id: string) => {
    const indexName = `${process.env[prefixNameEnv]}-${id}`;
    const indices = await getESClient().cat.indices();
    // tslint:disable-next-line:no-unused-expression
    expect(indices.body).to.not.contain(indexName);
  }
);

Then(
  /^the elasticsearch index with prefix "([^"]*)" has mapping:$/,
  async (prefixNameEnv: string, expected: string) => {
    const indices = await getESClient().cat.indices();

    // tslint:disable-next-line:no-unused-expression
    expect(indices.body).to.contain(process.env[prefixNameEnv]);
    expect(indices.statusCode).to.be.equal(200);

    // @todo this regex should stop at the first whitespace but does not in javascript
    const matches = (indices.body as string).match(
      new RegExp(`${process.env[prefixNameEnv]}[^ ]*`, 'gm')
    );

    const [indexName] = matches ?? [];

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
    const indices = await getESClient().cat.indices();

    // tslint:disable-next-line:no-unused-expression
    expect(indices.body).to.contain(process.env[prefixNameEnv]);
    expect(indices.statusCode).to.be.equal(200);

    // @todo this regex should stop at the first whitespace but does not in javascript
    const matches = (indices.body as string).match(
      new RegExp(`${process.env[prefixNameEnv]}[^ ]*`, 'gm')
    );

    const [indexName] = (matches ?? []).filter(
      (indexName: string) => !indexName.endsWith(notId)
    );

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
    const indices = await getESClient().cat.indices();

    // tslint:disable-next-line:no-unused-expression
    expect(indices.body).to.contain(process.env[prefixNameEnv]);
    expect(indices.statusCode).to.be.equal(200);

    // @todo this regex should stop at the first whitespace but does not in javascript
    const matches = (indices.body as string).match(
      new RegExp(`${process.env[prefixNameEnv]}[^ ]*`, 'gm')
    );

    const [indexName] = (matches ?? []).filter(
      (indexName: string) => !indexName.endsWith(notId)
    );

    const result = await getESClient().search({
      index: indexName as string,
      body: { query: { match: JSON.parse(expected) } },
    });

    expect(result.body.hits.total.value).to.equal(1);
  }
);
