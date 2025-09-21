// Node Module Imports
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useNavigate, useLocation } from "react-router";

// Local Imports
import "./App.css";
// Other Pages
import NonProfitOverall from "#nonprofitPage/NonProfitOverall";
import RefugeeOverall from "#refugeePage/RefugeeOverall";
import RefugeeSelectNonProfit from "#components/RefugeeSelectNonProfit/RefugeeSelectNonProfit";
// Other Components
import SubPageSelect from "#components/SubPageSelect/SubPageSelect";
// Util Functions
import { createPageNavigator } from "#utils/pathUtils";
import { OverallPages, RPages } from "#utils/pathUtils";

function App() {
  // Constant Variables
  const navigate = useNavigate();
  const location = useLocation();
  const pageNavigator = createPageNavigator(navigate, location);

  /**
   * Routes to the given subpage.
   * @param {string} subPage - The subpage to navigate to.
   */
  function subPageChoose(subPage) {
    if (subPage === OverallPages.NONPROFIT) {
      pageNavigator("/nonprofit");
    } else if (subPage === OverallPages.REFUGEE) {
      pageNavigator(`/refugee/${RPages.HOME}`);
    } else {
      pageNavigator("/");
    }
  }

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={<SubPageSelect changePage={subPageChoose} />}
        />
        <Route path="/nonprofit/*" element={<NonProfitOverall />} />
        <Route
          path="/refugee/"
          element={<RefugeeSelectNonProfit changePage={subPageChoose} />}
        />
        <Route path="/refugee/*" element={<RefugeeOverall />} />
      </Routes>
    </div>
  );
}

export default App;
