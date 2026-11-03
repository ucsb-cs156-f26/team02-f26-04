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
public class MenuItemReviewWebIT extends WebTestCase {

  @Test
  public void admin_user_can_create_menu_item_review() throws Exception {
    setupUser(true);

    page.getByText("Menu Item Reviews").click();

    page.getByText("Create MenuItemReview").click();
    assertThat(page.getByText("Create New Menu Item Review")).isVisible();

    page.getByTestId("MenuItemReviewForm-reviewerEmail").fill("student@example.com");
    page.getByTestId("MenuItemReviewForm-itemId").fill("1");
    page.getByTestId("MenuItemReviewForm-dateReviewed").fill("2026-10-31T14:30");
    page.getByTestId("MenuItemReviewForm-stars").fill("4");
    page.getByTestId("MenuItemReviewForm-comments").fill("Good Item!");
    page.getByTestId("MenuItemReviewForm-submit").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-reviewerEmail"))
        .hasText("student@example.com");
    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-itemId")).hasText("1");
    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-dateReviewed"))
        .hasText("2026-10-31T14:30:00");
    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-stars")).hasText("4");
    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-comments"))
        .hasText("Good Item!");
  }
}
