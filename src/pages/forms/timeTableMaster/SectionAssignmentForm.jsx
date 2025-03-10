import { useState, useEffect } from "react";
import {
  Grid,
  Button,
  CircularProgress,
  Box,
  Paper,
  Checkbox,
  styled,
  IconButton,
  tableCellClasses,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import CustomTextField from "../../../components/Inputs/CustomTextField";
import SearchIcon from "@mui/icons-material/Search";
import axios from "../../../services/Api";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CustomAutocomplete from "../../../components/Inputs/CustomAutocomplete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import useAlert from "../../../hooks/useAlert";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import FormWrapper from "../../../components/FormWrapper";
import { makeStyles } from "@mui/styles";
import { TablePagination } from "@mui/material";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const initialValues = {
  acYearId: null,
  schoolId: null,
  programIdForUpdate: null,
  programSpeId: null,
  yearsemId: null,
  sectionId: null,
  remarks: "",
  studentId: "",
};

const requiredFields = [
  "acYearId",
  "schoolId",
  "programSpeId",
  "yearsemId",
  "sectionId",
];

const ELIGIBLE_REPORTED_STATUS = {
  1: "No status",
  2: "Not Eligible",
  3: "Eligible",
  4: "Not Reported",
  5: "Pass Out",
  6: "Promoted",
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.headerWhite.main,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const useStyles = makeStyles((theme) => ({
  iconButton: {
    display: "flex",
    fontSize: 14,
  },
}));

function SectionAssignmentForm() {
  const [isNew, setIsNew] = useState(true);
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [sectionAssignmentId, setSectionAssignmentId] = useState(null);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [programSpeOptions, setProgramSpeOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [yearSemOptions, setYearSemOptions] = useState([]);
  const [studentDetailsOptions, setStudentDetailsOptions] = useState([]);
  const [programType, setProgramType] = useState("Sem");
  const [programId, setProgramId] = useState(null);
  const [programAssigmentId, setProgramAssignmentId] = useState(null);
  const [unAssigned, setUnAssigned] = useState([]);
  const [order, setOrder] = useState("ASC");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  const { id } = useParams();
  const { pathname } = useLocation();
  const { setAlertMessage, setAlertOpen } = useAlert();
  const setCrumbs = useBreadcrumbs();
  const navigate = useNavigate();
  const classes = useStyles();

  const checks = {};

  useEffect(() => {
    getAcademicyear();
    getSchool();
    if (
      pathname.toLowerCase() === "/timetablemaster/sectionassignmentform/new"
    ) {
      setIsNew(true);
      setCrumbs([
        { name: "TimeTable Master", link: "/TimeTableMaster/Section" },
        { name: "Section Assignment" },
        { name: "Create" },
      ]);
    } else {
      setIsNew(false);
      getSectionAssignmentData();
    }
  }, []);

  useEffect(() => {
    getProgramSpeData();
    getSectionData();
    getYearSemForUpdate();
    {
      isNew ? getStudentDetailsData() : getStudentDetailsDataOne();
    }
  }, [
    values.acYearId,
    values.schoolId,
    values.programSpeId,
    values.yearsemId,
    programType,
  ]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getAcademicyear = async () => {
    await axios
      .get(`/api/academic/academic_year`)
      .then((res) => {
        setAcademicYearOptions(
          res.data.data.map((obj) => ({
            value: obj.ac_year_id,
            label: obj.ac_year,
          }))
        );
      })
      .catch((error) => console.error(error));
  };

  const getSchool = async () => {
    await axios
      .get(`/api/institute/school`)
      .then((res) => {
        setSchoolOptions(
          res.data.data.map((obj) => ({
            value: obj.school_id,
            label: obj.school_name_short,
          }))
        );
      })
      .catch((error) => console.error(error));
  };

  const getProgramSpeData = async () => {
    if (values.schoolId)
      await axios
        .get(
          `/api/academic/fetchAllProgramsWithSpecialization/${values.schoolId}`
        )
        .then((res) => {
          setProgramSpeOptions(
            res.data.data.map((obj) => ({
              value: obj.program_specialization_id,
              label: obj.specialization_with_program,
            }))
          );
        })
        .catch((err) => console.error(err));
  };

  const getSectionData = async () => {
    if (values.schoolId)
      await axios
        .get(`/api/academic/fetchSectionBySchool/${values.schoolId}`)
        .then((res) => {
          setSectionOptions(
            res.data.data.map((obj) => ({
              value: obj.section_id,
              label: obj.section_name,
            }))
          );
        })
        .catch((err) => console.error(err));
  };

  const getYearSemForUpdate = async () => {
    if (!isNew)
      await axios
        .get(
          `/api/academic/fetchAllProgramsWithSpecialization/${values.schoolId}`
        )
        .then((res) => {
          const yearsem = [];
          res.data.data.filter((obj) => {
            if (obj.program_specialization_id === values.programSpeId) {
              yearsem.push(obj);

              setProgramAssignmentId(obj.program_assignment_id);
            }
          });

          const newYear = [];
          yearsem.forEach((obj) => {
            if (obj.program_type_name.toLowerCase() === "yearly") {
              setProgramType("Year");
              for (let i = 1; i <= obj.number_of_years; i++) {
                newYear.push({ value: i, label: "Year" + "-" + i });
              }
            }
            if (obj.program_type_name.toLowerCase() === "semester") {
              setProgramType("Sem");
              for (let i = 1; i <= obj.number_of_semester; i++) {
                newYear.push({ value: i, label: "Sem" + "-" + i });
              }
            }
          });

          setYearSemOptions(
            newYear.map((obj) => ({
              value: obj.value,
              label: obj.label,
            }))
          );
        })
        .catch((err) => console.error(err));
  };

  const getStudentDetailsData = async () => {
    if (
      values.acYearId &&
      values.schoolId &&
      values.programSpeId &&
      values.yearsemId &&
      programType === "Year"
    ) {
      await axios
        .get(
          `/api/student/fetchStudentDetailForSectionAssignment?ac_year_id=${values.acYearId}&school_id=${values.schoolId}&program_id=${programId}&program_specialization_id=${values.programSpeId}&current_year=${values.yearsemId}`
        )
        .then((res) => {
          setStudentDetailsOptions(res.data.data);
        })
        .catch((err) => console.error(err));
    } else if (
      values.acYearId &&
      values.schoolId &&
      values.programSpeId &&
      values.yearsemId &&
      programType === "Sem"
    ) {
      await axios
        .get(
          `/api/student/fetchStudentDetailForSectionAssignment?ac_year_id=${values.acYearId}&school_id=${values.schoolId}&program_id=${programId}&program_specialization_id=${values.programSpeId}&current_sem=${values.yearsemId}`
        )
        .then((res) => {
          setStudentDetailsOptions(res.data.data);
        })
        .catch((err) => console.error(err));
    }
  };

  const getStudentDetailsDataOne = async () => {
    await axios
      .get(
        `/api/student/fetchAllStudentDetailForSectionAssignmentForUpdate/${values.acYearId}/${values.schoolId}/${values.programIdForUpdate}/${values.programSpeId}/${values.yearsemId}/${values.sectionId}`
      )
      .then((res) => {
        console.log(res);
        // setStudentDetailsOptions(
        //   res.data.data.map((obj) => {
        //     return obj.section_id ? { ...obj, isChecked: true } : obj;
        //   })
        // );
      })
      .catch((err) => console.error(err));
  };

  const getSectionAssignmentData = async () => {
    await axios
      .get(`/api/academic/SectionAssignment/${id}`)
      .then((res) => {
        setValues({
          acYearId: res.data.data.ac_year_id,
          schoolId: res.data.data.school_id,
          programSpeId: res.data.data.program_specialization_id,
          yearsemId: res.data.data.current_year_sem,
          sectionId: res.data.data.section_id,
          remarks: res.data.data.remarks,
          programIdForUpdate: res.data.data.program_id,
          studentId: res.data.data.student_ids,
        });
        setSectionAssignmentId(res.data.data.section_assignment_id);
        setCrumbs([
          { name: "TimeTable Master", link: "/TimeTableMaster/Section" },
          { name: "Section Assignment" },
          { name: "Update" },
        ]);
      })
      .catch((err) => console.error(err));
  };

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleChangeAdvance = async (name, newValue) => {
    if (name === "programSpeId") {
      await axios
        .get(
          `/api/academic/fetchAllProgramsWithSpecialization/${values.schoolId}`
        )
        .then((res) => {
          const yearsem = [];
          res.data.data.filter((obj) => {
            if (obj.program_specialization_id === newValue) {
              yearsem.push(obj);
              setProgramId(obj.program_id);
              setProgramAssignmentId(obj.program_assignment_id);
            }
          });

          const newYear = [];
          yearsem.forEach((obj) => {
            if (obj.program_type_name.toLowerCase() === "yearly") {
              setProgramId(obj.program_id);
              setProgramAssignmentId(obj.program_assignment_id);
              setProgramType("Year");
              for (let i = 1; i <= obj.number_of_years; i++) {
                newYear.push({ value: i, label: "Year" + "-" + i });
              }
            }
            if (obj.program_type_name.toLowerCase() === "semester") {
              setProgramType("Sem");
              for (let i = 1; i <= obj.number_of_semester; i++) {
                newYear.push({ value: i, label: "Sem" + "-" + i });
              }
            }
          });

          setYearSemOptions(
            newYear.map((obj) => ({
              value: obj.value,
              label: obj.label,
            }))
          );
        })
        .catch((err) => console.error(err));
      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    } else {
      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }
  };

  const handleSorting = (col) => {
    if (order === "ASC") {
      const sorted = [...studentDetailsOptions].sort((a, b) =>
        a[col].toLowerCase() > b[col].toLowerCase() ? 1 : -1
      );
      setStudentDetailsOptions(sorted);
      setOrder("DSC");
    }
    if (order === "DSC") {
      const sorted = [...studentDetailsOptions].sort((a, b) =>
        a[col].toLowerCase() < b[col].toLowerCase() ? 1 : -1
      );
      setStudentDetailsOptions(sorted);
      setOrder("ASC");
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const requiredFieldsValid = () => {
    for (let i = 0; i < requiredFields.length; i++) {
      const field = requiredFields[i];
      if (Object.keys(checks).includes(field)) {
        const ch = checks[field];
        for (let j = 0; j < ch.length; j++) if (!ch[j]) return false;
      } else if (!values[field]) return false;
    }
    return true;
  };

  const handleCreate = async (e) => {
    if (!requiredFieldsValid()) {
      setAlertMessage({
        severity: "error",
        message: "please fill all fields",
      });
      setAlertOpen(true);
    } else {
      setLoading(true);
      const temp = {};
      temp.active = true;
      temp.ac_year_id = values.acYearId;
      temp.school_id = values.schoolId;
      temp.program_id = programId.toString();
      temp.program_specialization_id = values.programSpeId;
      temp.current_year_sem = values.yearsemId;
      temp.section_id = values.sectionId;
      temp.remarks = values.remarks;
      temp.student_ids = values.studentId.toString();
      temp.program_assignment_id = programAssigmentId;

      await axios
        .post(`/api/academic/SectionAssignment`, temp)
        .then((res) => {
          setLoading(false);
          if (res.status === 200 || res.status === 201) {
            navigate("/TimeTableMaster/Section", { replace: true });
            setAlertMessage({
              severity: "success",
              message: "Section Assignment Created",
            });
          } else {
            setAlertMessage({
              severity: "error",
              message: res.data ? res.data.message : "Error Occured",
            });
          }
          setAlertOpen(true);
        })
        .catch((error) => {
          setLoading(false);
          setAlertMessage({
            severity: "error",
            message: error.response ? error.response.data.message : "Error",
          });
          setAlertOpen(true);
        });
    }
  };

  const handleUpdate = async (e) => {
    if (!requiredFieldsValid()) {
      setAlertMessage({
        severity: "error",
        message: "Please fill required fields",
      });
      setAlertOpen(true);
    } else {
      setLoading(true);
      const temp = {};
      temp.active = true;
      temp.section_assignment_id = sectionAssignmentId;
      temp.ac_year_id = values.acYearId;
      temp.school_id = values.schoolId;
      temp.program_id = values.programIdForUpdate;
      temp.program_specialization_id = values.programSpeId;
      temp.current_year_sem = values.yearsemId;
      temp.section_id = values.sectionId;
      temp.remarks = values.remarks;
      temp.student_ids = values.studentId ? values.studentId.toString() : null;
      temp.program_assignment_id = programAssigmentId;

      if (unAssigned.length > 0) {
        await axios
          .put(
            `/api/academic/SectionAssignment/${id}/${unAssigned.toString()}`,
            temp
          )
          .then((res) => {
            setLoading(false);
            if (res.status === 200 || res.status === 201) {
              setAlertMessage({
                severity: "success",
                message: "Section Assignment Updated",
              });
              navigate("/TimeTableMaster/Section", { replace: true });
            } else {
              setAlertMessage({
                severity: "error",
                message: res.data ? res.data.message : "Error Occured",
              });
            }
            setAlertOpen(true);
          })
          .catch((error) => {
            setLoading(false);
            setAlertMessage({
              severity: "error",
              message: error.response.data.message,
            });
          });
      } else {
        await axios
          .put(`/api/academic/SectionAssignment/${id}`, temp)
          .then((res) => {
            setLoading(false);
            if (res.status === 200 || res.status === 201) {
              setAlertMessage({
                severity: "success",
                message: "Section Assignment Updated",
              });
              navigate("/SectionMaster/Assign", { replace: true });
            } else {
              setAlertMessage({
                severity: "error",
                message: res.data ? res.data.message : "Error Occured",
              });
            }
            setAlertOpen(true);
          })
          .catch((error) => {
            setLoading(false);
            setAlertMessage({
              severity: "error",
              message: error.response.data.message,
            });
          });
      }
    }

    const tempOne = {};
    tempOne.active = true;
    tempOne.section_assignment_id = sectionAssignmentId;
    tempOne.ac_year_id = values.acYearId;
    tempOne.school_id = values.schoolId;
    tempOne.program_id = values.programIdForUpdate;
    tempOne.program_specialization_id = values.programSpeId;
    tempOne.current_year_sem = values.current_year_sem;
    tempOne.section_id = values.sectionId;
    tempOne.remarks = values.remarks;
    tempOne.student_ids = values.studentId;

    await axios
      .post(`/api/academic/sectionAssignmentHistory`, tempOne)
      .then((res) => {
        setAlertMessage({
          severity: "success",
          message: "Section Assignment Updated",
        });
        setAlertOpen(true);
      })
      .catch((error) => {
        setAlertMessage({
          severity: "error",
          message: error.response ? error.response.data.message : "Error",
        });
        setAlertOpen(true);
      });
  };

  return (
    <Box component="form" overflow="hidden" p={1}>
      <FormWrapper>
        <Grid
          container
          alignItems="center"
          justifyContent="flex-start"
          rowSpacing={2}
          columnSpacing={{ xs: 2, md: 4 }}
        >
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="acYearId"
              label="Academic Year"
              value={values.acYearId}
              options={academicYearOptions}
              handleChangeAdvance={handleChangeAdvance}
              disabled={!isNew}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="schoolId"
              label="School"
              value={values.schoolId}
              options={schoolOptions}
              handleChangeAdvance={handleChangeAdvance}
              disabled={!isNew}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="programSpeId"
              label="Program Major"
              value={values.programSpeId}
              options={programSpeOptions}
              handleChangeAdvance={handleChangeAdvance}
              disabled={!isNew}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="yearsemId"
              label="Year/Sem"
              value={values.yearsemId}
              options={yearSemOptions}
              handleChangeAdvance={handleChangeAdvance}
              disabled={!isNew}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="sectionId"
              label="Section"
              value={values.sectionId}
              options={sectionOptions}
              handleChangeAdvance={handleChangeAdvance}
              disabled={!isNew}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <CustomTextField
              name="remarks"
              label="Remarks"
              value={values.remarks}
              handleChange={handleChange}
              disabled={!isNew}
            />
          </Grid>
        </Grid>

        <Grid
          container
          justifyContent="center"
          columnSpacing={{ xs: 2, md: 4 }}
        >
          {values.yearsemId ? (
            <Grid item xs={12} md={4} mt={2}>
              <CustomTextField
                label="Search"
                value={search}
                handleChange={handleSearch}
                InputProps={{
                  endAdornment: <SearchIcon />,
                }}
                disabled={!isNew}
              />
            </Grid>
          ) : (
            <></>
          )}
        </Grid>

        <Grid container justifyContent="center">
          {values.yearsemId ? (
            <>
              <Grid item xs={12} md={10} mt={2}>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>
                          {isNew ? (
                            <Checkbox
                              {...label}
                              sx={{ "& .MuiSvgIcon-root": { fontSize: 12 } }}
                              style={{ color: "white" }}
                              name="selectAll"
                              checked={
                                !studentDetailsOptions.some(
                                  (user) => user?.isChecked !== true
                                )
                              }
                              onChange={handleChange}
                            />
                          ) : (
                            ""
                          )}
                        </StyledTableCell>

                        <StyledTableCell
                          onClick={() => handleSorting("auid")}
                          style={{ cursor: "pointer" }}
                        >
                          <IconButton
                            classes={{ label: classes.iconButton }}
                            style={{ color: "white", fontSize: 12 }}
                          >
                            <ArrowUpwardIcon />
                            AUID
                          </IconButton>
                        </StyledTableCell>
                        <StyledTableCell onClick={() => handleSorting("usn")}>
                          <IconButton
                            classes={{ label: classes.iconButton }}
                            style={{ color: "white", fontSize: 12 }}
                          >
                            <ArrowUpwardIcon />
                            USN
                          </IconButton>
                        </StyledTableCell>
                        <StyledTableCell
                          onClick={() => handleSorting("student_name")}
                          style={{ cursor: "pointer" }}
                        >
                          <IconButton
                            classes={{ label: classes.iconButton }}
                            style={{ color: "white", fontSize: 12 }}
                          >
                            <ArrowUpwardIcon />
                            Student Name
                          </IconButton>
                        </StyledTableCell>

                        <StyledTableCell>Status</StyledTableCell>
                        <StyledTableCell>SL.No</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentDetailsOptions
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .filter((val) => {
                          if (search === "") {
                            return val;
                          } else if (
                            val.auid
                              .toLowerCase()
                              .includes(search.toLowerCase()) ||
                            val.student_name
                              .toLowerCase()
                              .includes(search.toLowerCase()) ||
                            val.usn.toLowerCase().includes(search.toLowerCase())
                          ) {
                            return val;
                          }
                        })
                        .map((obj, i) => (
                          <TableRow key={i}>
                            <TableCell style={{ height: "10px" }}>
                              <Checkbox
                                {...label}
                                sx={{ "& .MuiSvgIcon-root": { fontSize: 12 } }}
                                name={obj.student_id}
                                value={obj.student_id}
                                onChange={handleChange}
                                checked={obj?.isChecked || false}
                              />
                            </TableCell>

                            <TableCell style={{ height: "10px" }}>
                              {obj.auid}
                            </TableCell>
                            <TableCell style={{ height: "10px" }}>
                              {obj.usn}
                            </TableCell>
                            <TableCell style={{ height: "10px" }}>
                              {obj.student_name}
                            </TableCell>

                            <TableCell style={{ height: "10px" }}>
                              {
                                ELIGIBLE_REPORTED_STATUS[
                                  obj.eligible_reported_status
                                ]
                              }
                            </TableCell>
                            <TableCell style={{ height: "10px" }}>
                              {i + 1}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component={Paper}
                  rowsPerPageOptions={[100, 120, 130]}
                  count={studentDetailsOptions.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Grid>
            </>
          ) : (
            <></>
          )}
        </Grid>

        <Grid container justifyContent="flex-end" textAlign="right">
          <Grid item xs={12} md={2} mt={4}>
            <Button
              style={{ borderRadius: 7 }}
              variant="contained"
              color="primary"
              disabled={loading}
              onClick={isNew ? handleCreate : handleUpdate}
            >
              {loading ? (
                <CircularProgress
                  size={25}
                  color="blue"
                  style={{ margin: "2px 13px" }}
                />
              ) : (
                <strong>{isNew ? "Create" : "Update"}</strong>
              )}
            </Button>
          </Grid>
        </Grid>
      </FormWrapper>
    </Box>
  );
}

export default SectionAssignmentForm;
