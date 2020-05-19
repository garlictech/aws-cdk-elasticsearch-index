@on-event-delete
Feature: As a CloudFormation Stack
  I want to respond to delete events
  In order to delete a Stack

  @clearElasticSearch
  Scenario: OnEvent delete index
    Given lambda function "ON_EVENT_FUNCTION_NAME"
    And AWS port "ON_EVENT_PORT"
    # HACK TODO FIXME this depends on the env var prefix to be "test-index"
    And an elasticsearch index named "test-index-abc" exists with mapping:
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
    Then an elasticsearch index named "test-index-abc" does not exist
