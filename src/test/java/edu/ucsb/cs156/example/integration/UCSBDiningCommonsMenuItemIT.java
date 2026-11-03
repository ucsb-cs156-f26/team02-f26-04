package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.UCSBDiningCommonsMenuItem;
import edu.ucsb.cs156.example.repositories.UCSBDiningCommonsMenuItemRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class UCSBDiningCommonsMenuItemIT {

  @Autowired UCSBDiningCommonsMenuItemRepository repository;

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @Test
  @WithMockUser(roles = {"ADMIN", "USER"})
  public void an_admin_user_can_create_a_menu_item() throws Exception {
    // arrange
    long countBefore = repository.count();

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/UCSBDiningCommonsMenuItem/post")
                    .param("diningCommonsCode", "ortega")
                    .param("name", "Grilled Cheese")
                    .param("station", "Grill")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert: the response contains the submitted fields and a generated id
    UCSBDiningCommonsMenuItem created =
        mapper.readValue(
            response.getResponse().getContentAsString(), UCSBDiningCommonsMenuItem.class);

    assertTrue(created.getId() > 0);
    assertEquals("ortega", created.getDiningCommonsCode());
    assertEquals("Grilled Cheese", created.getName());
    assertEquals("Grill", created.getStation());

    // assert: the record was actually saved in the database
    assertEquals(countBefore + 1, repository.count());

    UCSBDiningCommonsMenuItem saved = repository.findById(created.getId()).orElseThrow();

    assertEquals(created, saved);
  }
}
