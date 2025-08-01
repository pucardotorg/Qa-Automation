Feature: Citizen auth token

  Scenario: citizen auth token generation
    Given I want to login auth token
    When I click on citizen URL
    Then auth token is generated as "authtoken"

