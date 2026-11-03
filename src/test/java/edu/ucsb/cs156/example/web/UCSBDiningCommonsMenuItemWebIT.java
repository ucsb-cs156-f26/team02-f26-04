package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import com.microsoft.playwright.Page;
import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class UCSBDiningCommonsMenuItemWebIT extends WebTestCase {

  @Test
  public void admin_user_can_create_a_menu_item_that_persists_after_reload() throws Exception {
    // Log in as an admin and open the create page through the user interface.
    setupUser(true);
    page.getByText("UCSBDiningCommonsMenuItem", new Page.GetByTextOptions().setExact(true)).click();
    page.getByText("Create UCSBDiningCommonsMenuItem").click();
    assertThat(page.getByText("Create New UCSBDiningCommonsMenuItem")).isVisible();

    // Fill in the form and submit it, just as a user would.
    page.getByTestId("UCSBDiningCommonsMenuItemForm-name").fill("Grilled Cheese");
    page.getByTestId("UCSBDiningCommonsMenuItemForm-diningCommonsCode").fill("ortega");
    page.getByTestId("UCSBDiningCommonsMenuItemForm-station").fill("Grill");
    page.getByTestId("UCSBDiningCommonsMenuItemForm-submit").click();

    // Creating the item should return to the index and display its saved fields.
    assertThat(page).hasURL(java.util.regex.Pattern.compile(".*/diningcommonsmenuitem$"));
    assertMenuItemIsDisplayed();

    // Reloading fetches the saved data again instead of relying on the current UI state.
    page.reload();
    assertMenuItemIsDisplayed();
  }

  private void assertMenuItemIsDisplayed() {
    String cellPrefix = "UCSBDiningCommonsMenuItemTable-cell-row-0-col-";
    assertThat(page.getByTestId(cellPrefix + "name")).hasText("Grilled Cheese");
    assertThat(page.getByTestId(cellPrefix + "diningCommonsCode")).hasText("ortega");
    assertThat(page.getByTestId(cellPrefix + "station")).hasText("Grill");
  }
}
