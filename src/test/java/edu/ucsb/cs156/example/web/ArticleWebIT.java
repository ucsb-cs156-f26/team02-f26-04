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
public class ArticleWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_article() throws Exception {
    setupUser(true);

    page.getByText("Articles").click();

    page.getByText("Create Article").click();
    assertThat(page.getByText("Create New Article")).isVisible();
    page.getByTestId("ArticleForm-title").fill("Freebirds");
    page.getByTestId("ArticleForm-url").fill("www.burrito.com");
    page.getByTestId("ArticleForm-dateAdded").fill("2026-10-30T14:30");
    page.getByTestId("ArticleForm-explanation").fill("I love burritos");
    page.getByTestId("ArticleForm-email").fill("burritolover@gmail.com");
    page.getByTestId("ArticleForm-submit").click();

    assertThat(page.getByTestId("ArticleTable-cell-row-0-col-explanation"))
        .hasText("I love burritos");

    page.getByTestId("ArticleTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Article")).isVisible();
    page.getByTestId("ArticleForm-explanation").fill("THE BEST");
    page.getByTestId("ArticleForm-submit").click();

    assertThat(page.getByTestId("ArticleTable-cell-row-0-col-explanation")).hasText("THE BEST");

    page.getByTestId("ArticleTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("ArticleTable-cell-row-0-col-title")).not().isVisible();
  }
}
