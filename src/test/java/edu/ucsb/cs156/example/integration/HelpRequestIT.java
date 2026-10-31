package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class HelpRequestIT {

  @Autowired public CurrentUserService currentUserService;

  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired HelpRequestRepository helpRequestRepository;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_help_request() throws Exception {
    // arrange
    LocalDateTime requestTime = LocalDateTime.parse("2026-10-31T14:30:00");

    HelpRequest expected =
        HelpRequest.builder()
            .id(1L)
            .requesterEmail("student@example.com")
            .teamId("team02")
            .tableOrBreakoutRoom("Table 5")
            .requestTime(requestTime)
            .explanation("Need help with the assignment")
            .solved(false)
            .build();

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/HelpRequest/post")
                    .param("requesterEmail", "student@example.com")
                    .param("teamId", "team02")
                    .param("tableOrBreakoutRoom", "Table 5")
                    .param("requestTime", "2026-10-31T14:30:00")
                    .param("explanation", "Need help with the assignment")
                    .param("solved", "false")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(expected);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);

    HelpRequest saved = helpRequestRepository.findById(1L).orElseThrow();
    assertEquals("student@example.com", saved.getRequesterEmail());
    assertEquals("team02", saved.getTeamId());
    assertEquals("Table 5", saved.getTableOrBreakoutRoom());
    assertEquals(requestTime, saved.getRequestTime());
    assertEquals("Need help with the assignment", saved.getExplanation());
    assertEquals(false, saved.getSolved());
  }
}
