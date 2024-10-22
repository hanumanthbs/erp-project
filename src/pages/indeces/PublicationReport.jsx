import { useState, useEffect } from "react";
import axios from "../../services/Api";
import { Box, IconButton,Grid,Typography } from "@mui/material";
import GridIndex from "../../components/GridIndex";
import useAlert from "../../hooks/useAlert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { useNavigate } from "react-router-dom";
import ModalWrapper from "../../components/ModalWrapper";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import moment from "moment";

const empId = sessionStorage.getItem("empId");

function PublicationReport() {
  const [rows, setRows] = useState([]);
  const [isApprover,setIsApprover] = useState(false);
  const { setAlertMessage, setAlertOpen } = useAlert();
  const [modalOpen, setModalOpen] = useState(false);
  const [timeLineList,setTimeLineList] = useState([]);
  const navigate = useNavigate();

  const columns = [
    {
      field: "",
      headerName: "Application Status",
      flex: 1,
      renderCell: (params) => (
        <IconButton
          onClick={() => handleIncentive(params)}
          sx={{ padding: 0, color: "primary.main" }}
        >
          <PlaylistAddIcon sx={{ fontSize: 22 }} />
        </IconButton>
      ),
    },
    {
      field: "empcode",
      headerName: "Emp Code",
      flex: 1,
      hide: !!isApprover ? false : true,
      hideable: !!isApprover ? true : false,
    },
    {
      field: "employee_name",
      headerName: " Name",
      flex: 1,
      hide: !!isApprover ? false : true,
      hideable: !!isApprover ? true : false,
    },
    {
      field: "dept_name_short",
      headerName: "Department",
      flex: 1,
      hide: !!isApprover ? false : true,
      hideable: !!isApprover ? true : false,
    },
    {
      field: "experience",
      headerName: "Exp. at Acharya",
      flex: 1,
      hide: !!isApprover ? false : true,
      hideable: !!isApprover ? true : false,
    },
    { field: "Type", headerName: " Type", flex: 1 },
    { field: "journal_name", headerName: "Journal Name", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 ,hide: !!isApprover ? true : false},
    {
      field: "volume",
      headerName: "Volume",
      flex: 1,
      hide: !!isApprover ? true : false
    },
    {
      field: "issue_number",
      headerName: "Issue Number",
      flex: 1,
    },

    {
      field: "paper_title",
      headerName: "Paper Title",
      flex: 1,
    },
    {
      field: "page_number",
      headerName: "Paper Number",
      flex: 1,
      hide: !!isApprover ? true : false
    },
    {
      field: "issn",
      headerName: "ISSN",
      flex: 1,
      hide: !!isApprover ? true : false
    },
    {
      field: "issn_type",
      headerName: "ISSN Type",
      flex: 1,
      hide: !!isApprover ? true : false
    },

    {
      field: "attachment_path",
      type: "actions",
      flex: 1,
      headerName: "View",
      hide: !!isApprover ? true : false,
      getActions: (params) => [
        params.row.attachment_path ? (
          <IconButton
            onClick={() => handleDownload(params.row.attachment_path)}
            sx={{ padding: 0 }}
          >
            <VisibilityIcon
              fontSize="small"
              color="primary"
              sx={{ cursor: "pointer" }}
            />
          </IconButton>
        ) : (
          <></>
        ),
      ],
    },
    {
      field: "id",
      type: "actions",
      flex: 1,
      headerName: "TimeLine",
      getActions: (params) => [
        <IconButton onClick={() => handleFollowUp(params)} sx={{ padding: 0 }}>
          <NoteAddIcon
            fontSize="small"
            color="primary"
            sx={{ cursor: "pointer" }}
          />
        </IconButton>,
      ],
    },
  ];

  useEffect(() => {
    getApproverName(empId)
  }, []);

  const getApproverName = async (empId) => {
    try {
      const res = await axios.get(`/api/employee/getApproverDetailsData/${empId}`);
      if (res?.status == 200 || res?.status == 201) {
        const isApprover = res.data.data?.find((ele)=>ele.emp_id == empId) ? true : false;
        getData(isApprover);
        setIsApprover(isApprover)
      }
    } catch (error) {
      setAlertMessage({
        severity: "error",
        message: error.response
          ? error.response.data.message
          : "An error occured !!",
      });
      setAlertOpen(true);
    }
  };

  const getData = async (isApprover) => {
    if(!!isApprover){
      await axios
      .get(`api/employee/fetchAllPublication?page=0&page_size=10&sort=created_date`)
      .then((res) => {
        setRows(res.data.data.Paginated_data.content);
      })
      .catch((error) => {
        setAlertMessage({
          severity: "error",
          message: error.response
            ? error.response.data.message
            : "An error occured !!",
        });
        setAlertOpen(true);
      });
    }else {
      await axios
        .get(`/api/employee/publicationDetailsBasedOnEmpId/${empId}`)
        .then((res) => {
          setRows(res.data.data);
        })
        .catch((error) => {
          setAlertMessage({
            severity: "error",
            message: error.response
              ? error.response.data.message
              : "An error occured !!",
          });
          setAlertOpen(true);
        });
    }
  };

  const handleDownload = async (path) => {
    await axios
      .get(`/api/employee/publicationsFileviews?fileName=${path}`, {
        responseType: "blob",
      })
      .then((res) => {
        const url = URL.createObjectURL(res.data);
        window.open(url);
      })
      .catch((err) => console.error(err));
  };

  const handleIncentive = (params) => {
    navigate("/addon-incentive-application", {
      state: {isApprover: isApprover, tabName: "PUBLICATION", rowData: params.row },
    });
  };

  const handleFollowUp = async(params) => {
    try {
        const res = await axios.get(`/api/employee/incentiveApproverBasedOnEmpId/${params.row?.emp_id}/${params.row?.incentive_approver_id}`);
        if (res?.status == 200 || res?.status == 201) {
          setModalOpen(!modalOpen);
          const timeLineLists = [
            {date:params.row.created_date,type:"Initiated By",name:params.row?.created_username},
            {date:res.data.data[0]?.hod_date,type:"Head of Department",note:res.data.data[0]?.hod_remark,name:res.data.data[0]?.hod_name},
            {date:res.data.data[0]?.hoi_date,type:"Head of Institute",note:res.data.data[0]?.hoi_remark,name:res.data.data[0]?.hoi_name},
            {date:res.data.data[0]?.dean_date,type:"Dean R & D",note:res.data.data[0]?.dean_remark,name:res.data.data[0]?.dean_name},
            {date:res.data.data[0]?.asst_dir_date,type:"Assistant Director R & D",note:res.data.data[0]?.asst_dir_remark,name:res.data.data[0]?.asst_dir_name},
            {date:res.data.data[0]?.qa_date,type:"Quality Assurance",note:res.data.data[0]?.qa_remark,name:res.data.data[0]?.qa_name,amount:res.data?.data[0]?.amount},
            {date:res.data.data[0]?.hr_date,type:"Human Resources",note:res.data.data[0]?.hr_remark,name:res.data.data[0]?.hr_name},
            {date:res.data.data[0]?.finance_date,type:"Finance",note:res.data.data[0]?.finance_remark,name:res.data.data[0]?.finance_name}
          ]
          setTimeLineList(timeLineLists)
        }
    } catch (error) {
      setAlertMessage({
        severity: "error",
        message: error.response
          ? error.response.data.message
          : "An error occured !!",
      });
      setAlertOpen(true);
    }
  };

  return (
    <>
       <ModalWrapper
        open={modalOpen}
        setOpen={setModalOpen}
        maxWidth={800}
        title={"TimeLine"}
      >
        <Box p={1}>
          <Grid container>
            <Grid xs={12}>
              <Timeline>
                {!!timeLineList.length && timeLineList.map((obj,index)=>(
                  <TimelineItem key={index}>
                  <TimelineOppositeContent color="textSecondary">
                        <Typography>{!!obj.date ? moment(obj.date).format('lll'): ""}</Typography>
                        <Typography>{obj.type}</Typography>
                        {index !=0 && <Typography sx={{fontWeight:"500"}}>{obj.name}</Typography>}
                  </TimelineOppositeContent>
                  {!obj.date && <TimelineSeparator>
                    <TimelineDot>
                      <CircleIcon color="error" />
                    </TimelineDot>
                    {index < timeLineList.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>}
                  {!!obj.date && <TimelineSeparator>
                    <TimelineDot>
                      <CheckCircleIcon color="success" />
                    </TimelineDot>
                    {index < timeLineList.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>}
                  <TimelineContent>
                  {index!=0 && <Typography><span style={{fontWeight:"500"}}>Remark</span> :- {obj.note}</Typography>}
                  {!!obj.amount && <Typography><span style={{fontWeight:"500"}}>Amount</span> - {obj.amount}</Typography>}
                  {index == 0 && <Typography sx={{fontWeight:"500"}}>{obj.name}</Typography>}
                  </TimelineContent>
                </TimelineItem>
                ))}
              </Timeline>
            </Grid>
          </Grid>
        </Box>
      </ModalWrapper>
      <Box sx={{ position: "relative", mt: 2 }}>
        <GridIndex rows={rows} columns={columns} />
      </Box>
    </>
  );
}
export default PublicationReport;
