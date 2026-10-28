const menuItemReviewFixtures = {
  oneMenuItemReview: {
    id: 1,
    itemId: 1,
    stars: 5,
    reviewerEmail: "reviewer@example.com",
    dateReviewed: "2022-01-02T12:00:00",
    comments: "Excellent item!",
  },
  threeMenuItemReviews: [
    {
      id: 1,
      itemId: 1,
      stars: 5,
      reviewerEmail: "reviewer1@example.com",
      dateReviewed: "2022-01-02T12:00:00",
      comments: "Excellent item!",
    },
    {
      id: 2,
      itemId: 2,
      stars: 4,
      reviewerEmail: "reviewer2@example.com",
      dateReviewed: "2022-04-03T12:00:00",
      comments: "Good item!",
    },
    {
      id: 3,
      itemId: 3,
      stars: 3,
      reviewerEmail: "reviewer3@example.com",
      dateReviewed: "2022-07-04T12:00:00",
      comments: "Average item!",
    },
  ],
};

export { menuItemReviewFixtures };
