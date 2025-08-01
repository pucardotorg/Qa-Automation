Feature: Litigent User Search

  Scenario: Search for a litigant by UUID
    Given I want to search for a litigant
    When I request the litigant user information
    Then the response should be successful and contain the litigant information