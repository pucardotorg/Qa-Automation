Feature: Citizen Authentication

  Scenario: Obtain citizen auth token
    Given I have valid credentials
    When I request the citizen auth token
    Then I should receive a valid auth token 