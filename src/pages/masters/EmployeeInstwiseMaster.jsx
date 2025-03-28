import { useState, useEffect } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import useBreadcrumbs from "../../hooks/useBreadcrumbs";
import EmployeeInstwiseIndex from "../indeces/EmployeeInstwiseIndex";

function EmployeeInstwiseMaster() {
  const [tab, setTab] = useState("Staff");

  const setCrumbs = useBreadcrumbs();

  useEffect(() => {
    setCrumbs([{ name: "Employee Master" }]);
  }, []);

  const handleChange = (e, newValue) => {
    setTab(newValue);
  };

  return (
    <Box>
      <Tabs value={tab} onChange={handleChange}>
        <Tab value="Staff" label="Staff" />
        <Tab value="Consultant" label="Consultant" />
      </Tabs>

      {tab === "Staff" && <EmployeeInstwiseIndex tab={tab} />}
      {tab === "Consultant" && <EmployeeInstwiseIndex tab={tab} />}
    </Box>
  );
}

export default EmployeeInstwiseMaster;
