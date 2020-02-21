Feature: As a user
  I want to deploy an elastic search domain with an index
  In order to index against a discrete mapping

  @stack
  Scenario: Create New Stack
    When I a create a new stack with index named "test_index" and mapping:
    """
    {
      "mappings": {
        "properties" : {
          "field1" : { "type" : "text" }
        }
      }
    }
    """
    Then there should be an index named "test_index"
    And the index "test_index" should have mapping:
    """
    {
      "mappings": {
        "properties" : {
          "field1" : { "type" : "text" }
        }
      }
    }
    """
