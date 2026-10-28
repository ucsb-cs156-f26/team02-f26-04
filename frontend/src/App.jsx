import { Routes, Route } from "react-router";
import HomePage from "main/pages/HomePage";
import ProfilePage from "main/pages/ProfilePage";
import AdminUsersPage from "main/pages/AdminUsersPage";

import UCSBDatesIndexPage from "main/pages/UCSBDates/UCSBDatesIndexPage";
import UCSBDatesCreatePage from "main/pages/UCSBDates/UCSBDatesCreatePage";
import UCSBDatesEditPage from "main/pages/UCSBDates/UCSBDatesEditPage";

import RestaurantIndexPage from "main/pages/Restaurants/RestaurantIndexPage";
import RestaurantCreatePage from "main/pages/Restaurants/RestaurantCreatePage";
import RestaurantEditPage from "main/pages/Restaurants/RestaurantEditPage";

import PlaceholderIndexPage from "main/pages/Placeholder/PlaceholderIndexPage";
import PlaceholderCreatePage from "main/pages/Placeholder/PlaceholderCreatePage";
import PlaceholderEditPage from "main/pages/Placeholder/PlaceholderEditPage";

import HelpRequestIndexPage from "main/pages/HelpRequest/HelpRequestIndexPage";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";

import UCSBOrganizationIndexPage from "main/pages/UCSBOrganization/UCSBOrganizationIndexPage";
import UCSBOrganizationCreatePage from "main/pages/UCSBOrganization/UCSBOrganizationCreatePage";
import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";

import { hasRole, useCurrentUser } from "main/utils/useCurrentUser";

import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";

import UCSBDiningCommonsMenuItemIndexPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemIndexPage";
import UCSBDiningCommonsMenuItemCreatePage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemCreatePage";
import UCSBDiningCommonsMenuItemEditPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemEditPage";

function App() {
  const currentUser = useCurrentUser();

  return (
    <Routes>
      <Route exact path="/" element={<HomePage />} />
      <Route exact path="/profile" element={<ProfilePage />} />

      {hasRole(currentUser, "ROLE_ADMIN") && (
        <Route exact path="/admin/users" element={<AdminUsersPage />} />
      )}

      {hasRole(currentUser, "ROLE_USER") && (
        <>
          <Route exact path="/ucsbdates" element={<UCSBDatesIndexPage />} />
          <Route exact path="/restaurants" element={<RestaurantIndexPage />} />
          <Route exact path="/placeholder" element={<PlaceholderIndexPage />} />
          <Route exact path="/helprequest" element={<HelpRequestIndexPage />} />
          <Route
            exact
            path="/ucsborganization"
            element={<UCSBOrganizationIndexPage />}
          />
          <Route
            exact
            path="/diningcommonsmenuitem"
            element={<UCSBDiningCommonsMenuItemIndexPage />}
          />
        </>
      )}

      {hasRole(currentUser, "ROLE_ADMIN") && (
        <>
          <Route
            exact
            path="/ucsbdates/edit/:id"
            element={<UCSBDatesEditPage />}
          />
          <Route
            exact
            path="/ucsbdates/create"
            element={<UCSBDatesCreatePage />}
          />
          <Route
            exact
            path="/restaurants/edit/:id"
            element={<RestaurantEditPage />}
          />
          <Route
            exact
            path="/restaurants/create"
            element={<RestaurantCreatePage />}
          />
          <Route
            exact
            path="/helprequest/edit/:id"
            element={<HelpRequestEditPage />}
          />
          <Route
            exact
            path="/helprequest/create"
            element={<HelpRequestCreatePage />}
          />
          <Route
            exact
            path="/ucsborganization/edit/:id"
            element={<UCSBOrganizationEditPage />}
          />
          <Route
            exact
            path="/ucsborganization/create"
            element={<UCSBOrganizationCreatePage />}
          />
          <Route
            exact
            path="/placeholder/edit/:id"
            element={<PlaceholderEditPage />}
          />
          <Route
            exact
            path="/placeholder/create"
            element={<PlaceholderCreatePage />}
          />
          <Route
            exact
            path="/diningcommonsmenuitem/create"
            element={<UCSBDiningCommonsMenuItemCreatePage />}
          />
          <Route
            exact
            path="/diningcommonsmenuitem/edit/:id"
            element={<UCSBDiningCommonsMenuItemEditPage />}
          />
        </>
      )}
    </Routes>
  );
}

export default App;
