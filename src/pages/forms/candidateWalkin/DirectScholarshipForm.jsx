import { lazy, useEffect, useState } from "react";
import axios from "../../../services/Api";
import { Box, Button, CircularProgress, Grid } from "@mui/material";
import CustomTextField from "../../../components/Inputs/CustomTextField";
import useAlert from "../../../hooks/useAlert";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import FormPaperWrapper from "../../../components/FormPaperWrapper";

const StudentDetails = lazy(() => import("../../../components/StudentDetails"));
const DirectScholarshipAmountForm = lazy(() =>
  import("./DirectScholarshipAmountForm")
);

const initialValues = {
  auid: "",
  residency: "rented",
  scholarship: "false",
  scholarshipYes: "",
  reason: "",
  income: "",
  occupation: "",
  scholarshipData: {},
  document: "",
  remarks: "",
  adjStatus: true,
};

const breadCrumbsList = [
  { name: "Verify Scholarship", link: "/verify-scholarship" },
  { name: "Create" },
];

function DirectScholarshipForm() {
  const [values, setValues] = useState(initialValues);
  const [studentData, setStudentData] = useState(null);
  const [feeTemplateData, setFeeTemplateData] = useState(null);
  const [noOfYears, setNoOfYears] = useState([]);
  const [feeTemplateSubAmountData, setFeeTemplateSubAmountData] = useState([]);
  const [yearwiseSubAmount, setYearwiseSubAmount] = useState([]);
  const [reasonOptions, setReasonOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const { setAlertMessage, setAlertOpen } = useAlert();
  const setCrumbs = useBreadcrumbs();

  const checks = {
    auid: [
      values.auid !== "",
      /^[a-zA-Z0-9]*$/.test(values.auid),
      /^[A-Za-z]{3}\d{2}[A-Za-z]{4}\d{3}$/.test(values.auid),
    ],
  };

  const errorMessages = {
    auid: [
      "This field is required",
      "Special characters and space is not allowed",
      "Invalid AUID",
    ],
  };

  useEffect(() => {
    setCrumbs(breadCrumbsList);
  }, []);

  const handleChange = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `/api/student/studentDetailsByAuid/${values.auid}`
      );
      if (response.data.data.length === 0) {
        setAlertMessage({
          severity: "error",
          message: "AUID is not present !!",
        });
        setAlertOpen(true);
        return;
      }

      const data = response.data.data[0];

      await getData(data);
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message:
          err.response?.data?.message || "Failed to fetch the student details!",
      });
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const getData = async (data) => {
    const {
      fee_template_id,
      student_id,
      program_type_name,
      number_of_years,
      number_of_semester,
    } = data;

    try {
      const [
        feeTemplateResponse,
        subAmountResponse,
        reasonResponse,
        scholarshipResponse,
      ] = await Promise.all([
        axios.get(`/api/finance/FetchAllFeeTemplateDetail/${fee_template_id}`),
        axios.get(
          `/api/finance/FetchFeeTemplateSubAmountDetail/${fee_template_id}`
        ),
        axios.get("/api/categoryTypeDetailsForReasonFeeExcemption"),
        axios.get(
          `/api/student/scholarshipHeadWiseAmountDetailsOnStudentId/${student_id}`
        ),
      ]);

      const feeTemplateData = feeTemplateResponse.data.data[0];
      const feeTemplateSubAmtData = subAmountResponse.data.data;
      const schData = scholarshipResponse.data.data;
      const schheadwiseYears = [];
      schData.forEach((obj) => {
        schheadwiseYears.push(obj.scholarship_year);
      });

      const optionData = [];
      reasonResponse.data.data.forEach((obj) => {
        optionData.push({
          value: obj.category_type_id,
          label: obj.category_detail,
        });
      });

      const yearSemesters = [];
      const subAmountMapping = {};
      const scholarshipDataMapping = {};
      const disableYears = {};
      const totalYearsOrSemesters =
        program_type_name === "Yearly"
          ? number_of_years * 2
          : number_of_semester;

      for (let i = 1; i <= totalYearsOrSemesters; i++) {
        if (
          feeTemplateData.program_type_name === "Semester" ||
          (feeTemplateData.program_type_name === "Yearly" && i % 2 !== 0)
        ) {
          yearSemesters.push({ key: i, value: `Sem ${i}` });
          scholarshipDataMapping[`year${i}`] = "";
          subAmountMapping[`year${i}`] =
            feeTemplateSubAmtData[0][`fee_year${i}_amt`];
          disableYears[`year${i}`] = schheadwiseYears.includes(i);
        }
      }

      const rowTot = {};

      feeTemplateSubAmtData.forEach((obj) => {
        const { voucher_head_new_id } = obj;
        const subAmount = {};
        yearSemesters.forEach((obj1) => {
          subAmount[`year${obj1.key}`] = obj[`year${obj1.key}_amt`];
        });
        rowTot[voucher_head_new_id] = Object.values(subAmount).reduce(
          (a, b) => a + b
        );
      });
      const templateTotal = Object.values(rowTot).reduce((a, b) => a + b);

      setStudentData(data);
      setFeeTemplateData(feeTemplateData);
      setFeeTemplateSubAmountData(feeTemplateSubAmtData);
      setNoOfYears(yearSemesters);
      setYearwiseSubAmount(subAmountMapping);
      setValues((prev) => ({
        ...prev,
        scholarshipData: scholarshipDataMapping,
        disableYears: disableYears,
        rowTotal: rowTot,
        total: templateTotal,
      }));
      setReasonOptions(optionData);
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message:
          err.response?.data?.message || "Failed to load fee template details!",
      });
      setAlertOpen(true);
    }
  };

  const renderAuidRow = () => {
    return (
      <>
        <Grid item xs={12} md={3}>
          <CustomTextField
            name="auid"
            label="AUID"
            value={values.auid}
            handleChange={handleChange}
            checks={checks.auid}
            errors={errorMessages.auid}
          />
        </Grid>

        <Grid
          item
          xs={12}
          md={2}
          sx={{ textAlign: { xs: "right", md: "left" } }}
        >
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || values.auid === ""}
          >
            {loading ? (
              <CircularProgress
                size={25}
                color="blue"
                style={{ margin: "2px 13px" }}
              />
            ) : (
              "Submit"
            )}
          </Button>
        </Grid>
      </>
    );
  };

  return (
    <Box sx={{ margin: { xs: "20px 0px 0px 0px", md: "15px 15px 0px 15px" } }}>
      <FormPaperWrapper>
        <Grid container columnSpacing={2} rowSpacing={4}>
          {renderAuidRow()}
          {studentData && (
            <>
              <Grid item xs={12}>
                <StudentDetails id={studentData.student_id} />
              </Grid>
              <Grid item xs={12}>
                <DirectScholarshipAmountForm
                  feeTemplateData={feeTemplateData}
                  feeTemplateSubAmountData={feeTemplateSubAmountData}
                  noOfYears={noOfYears}
                  yearwiseSubAmount={yearwiseSubAmount}
                  values={values}
                  setValues={setValues}
                  reasonOptions={reasonOptions}
                  setAlertMessage={setAlertMessage}
                  setAlertOpen={setAlertOpen}
                  studentData={studentData}
                />
              </Grid>
            </>
          )}
        </Grid>
      </FormPaperWrapper>
    </Box>
  );
}

export default DirectScholarshipForm;
