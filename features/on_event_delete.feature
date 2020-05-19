@on-event-delete
Feature: As a CloudFormation Stack
  I want to respond to delete events
  In order to delete a Stack

  @clearElasticSearch
  Scenario: OnEvent delete index
    Given lambda function "ON_EVENT_FUNCTION_NAME"
    And AWS port "ON_EVENT_PORT"
    And an elasticsearch index with prefix "ON_EVENT_INDEX" and id "abc" exists with mapping:
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
      "RequestType": "Delete",
      "PhysicalResourceId": "abc"
    }
    """
    Then an elasticsearch index with prefix "ON_EVENT_INDEX" and id "abc" does not exist
