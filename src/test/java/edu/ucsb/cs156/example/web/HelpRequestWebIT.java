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
public class HelpRequestWebIT extends WebTestCase {

  @Test
  public void admin_user_can_create_help_request() throws Exception {
    setupUser(true);

    page.getByText("Help Requests").click();

    page.getByText("Create HelpRequest").click();
    assertThat(page.getByText("Create Help Request")).isVisible();

    page.getByTestId("HelpRequestForm-requesterEmail").fill("student@example.com");
    page.getByTestId("HelpRequestForm-teamId").fill("team02");
    page.getByTestId("HelpRequestForm-tableOrBreakoutRoom").fill("Table 5");
    page.getByTestId("HelpRequestForm-requestTime").fill("2026-10-31T14:30");
    page.getByTestId("HelpRequestForm-explanation").fill("Need help with the assignment");
    page.getByTestId("HelpRequestForm-submit").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("student@example.com");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-teamId")).hasText("team02");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-tableOrBreakoutRoom"))
        .hasText("Table 5");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation"))
        .hasText("Need help with the assignment");
  }
}
