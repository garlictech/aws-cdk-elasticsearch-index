@on-event
@on-event-create
Feature: As a CloudFormation Stack
  I want to respond to create events
  In order to create a Stack

  @clearElasticSearch
  Scenario: OnEvent create index
    Given lambda function "ON_EVENT_FUNCTION_NAME"
    And AWS port "ON_EVENT_PORT"
    And a index configuration file "ON_EVENT_S3_OBJECT_KEY" exists in bucket "ON_EVENT_S3_BUCKET_NAME" with contents:
    """
    {
      "mappings": {
        "properties" : {
          "field1" : { "type" : "text" }
        }
      }
    }
    """
    When I send an event with body:
    """
    {
      "RequestType": "Create"
    }
    """
    Then an elasticsearch index with prefix "ON_EVENT_INDEX" exists
    And the elasticsearch index with prefix "ON_EVENT_INDEX" has mapping:
    """
    {
      "properties" : {
        "field1" : { "type" : "text" }
      }
    }
    """
    And the response will match schema:
    """
    {
      "definitions": {},
      "$schema": "http://json-schema.org/draft-07/schema#",
      "$id": "http://example.com/root.json",
      "type": "object",
      "title": "The Root Schema",
      "required": [
        "PhysicalResourceId",
        "Data"
      ],
      "properties": {
        "PhysicalResourceId": {
          "$id": "#/properties/PhysicalResourceId",
          "type": "string",
          "examples": [
            "0123abc"
          ],
          "pattern": "^[a-f0-9]+$"
        },
        "Data": {
          "$id": "#/properties/Data",
          "type": "object",
          "required": [
            "IndexName"
          ],
          "properties": {
            "IndexName": {
              "$id": "#/properties/IndexName",
              "type": "string",
              "examples": [
                "index-name-ABCDEFG"
              ],
              "pattern": "^.*-[a-f0-9]+$"
            }
          }
        }
      }
    }
    """
