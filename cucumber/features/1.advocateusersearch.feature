Feature: Advocate User Search

  Scenario: Search for an advocate by UUID
    Given I want to search for an advocate
    When I request the advocate user information
    Then the response should be successful and contain the advocate information