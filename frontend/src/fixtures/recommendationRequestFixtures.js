const recommendationRequestFixtures = {
    oneRecommendationRequest: {
        id: 1,
        requesterEmail: "student@example.com",
        professorEmail: "professor@example.com",
        explanation: "BS/MS program",
        dateRequested: "2026-10-27T04:40:36.494Z",
        dateNeeded: "2026-11-15T00:00:00.000Z",
        done: false,
    },

    threeRecommendationRequests: [
        {
            id: 1,
            requesterEmail: "student@example.com",
            professorEmail: "professor@example.com",
            explanation: "BS/MS program",
            dateRequested: "2026-10-27T04:40:36.494Z",
            dateNeeded: "2026-11-15T00:00:00.000Z",
            done: false,
        },
        {
            id: 2,
            requesterEmail: "student2@example.com",
            professorEmail: "professor2@example.com",
            explanation: "Research opportunity",
            dateRequested: "2026-10-28T04:40:36.494Z",
            dateNeeded: "2026-11-16T00:00:00.000Z",
            done: false,
        },
        {
            id: 3,
            requesterEmail: "student3@example.com",
            professorEmail: "professor3@example.com",
            explanation: "PHD application",
            dateRequested: "2026-10-29T04:40:36.494Z",
            dateNeeded: "2026-11-17T00:00:00.000Z",
            done: false,
        }
    ]
};

export { recommendationRequestFixtures };