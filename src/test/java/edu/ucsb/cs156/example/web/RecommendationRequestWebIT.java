package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class RecommendationRequestWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_recommendation_request() throws Exception {
    setupUser(true);

    page.getByText("RecommendationRequest").click();

    page.getByText("Create Recommendation Request").click();
    assertThat(page.getByText("Create New Recommendation Request")).isVisible();
    page.getByTestId("RecommendationRequestForm-requesterEmail").fill("student@ucsb.edu");
    page.getByTestId("RecommendationRequestForm-professorEmail").fill("professor@ucsb.edu");
    page.getByTestId("RecommendationRequestForm-explanation").fill("Graduate school application");
    page.getByTestId("RecommendationRequestForm-dateRequested").fill("2026-01-02T03:04");
    page.getByTestId("RecommendationRequestForm-dateNeeded").fill("2026-02-03T04:05");
    page.getByTestId("RecommendationRequestForm-submit").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("student@ucsb.edu");
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation"))
        .hasText("Graduate school application");
  }
}
