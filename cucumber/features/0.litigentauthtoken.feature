Feature: Litigent Authentication

  Scenario: Obtain litigant auth token
    Given I want to login as a litigant
    When I request the litigant auth token
    Then litigant auth token is generated as "authtoken"