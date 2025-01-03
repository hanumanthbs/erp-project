import { useState, useEffect } from "react";
import axios from "../../../services/Api";
import {
  Grid,
  Paper,
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  styled,
  tableCellClasses,
  TableHead,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAlert from "../../../hooks/useAlert";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#edeff7",
    color: "black",
    border: "1px solid #DCDCDC",
    textAlign: "center",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    border: "1px solid #DCDCDC",
    textAlign: "center",
    width: "33.33%",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
}));

function PaidAtBoardReport() {
  const [boardWiseDue, setBoardWiseDue] = useState([]);
  const navigate = useNavigate();
  const { setAlertMessage, setAlertOpen } = useAlert();

  useEffect(() => {
    getBoardWiseDue();
  }, []);

  const getBoardWiseDue = async () => {
    try {
      const boardWiseResponse = await axios.get(
        `/api/finance/paidBoardReportBasedOnBoard`
      );
      setBoardWiseDue(boardWiseResponse.data.data);
    } catch (error) {
      setAlertMessage({
        severity: "error",
        message: error.response.data.message,
      });
      setAlertOpen(true);
    }
  };

  return (
    <>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container justifyContent="center" alignItems="center" mt={2}>
          <Grid item xs={12} md={8}>
            <Grid
              container
              justifyContent="flex-start"
              rowSpacing={2}
              alignItems="center"
            >
              <Grid item xs={12} md={12}>
                <Typography
                  sx={{
                    backgroundColor: "tableBg.main",
                    color: "tableBg.textColor",
                    textAlign: "center",
                    padding: 1,
                    borderRadius: 4,
                  }}
                  variant="h6"
                >
                  Paid At Board
                </Typography>
              </Grid>

              <Grid item xs={12} md={12}>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <StyledTableRow>
                        <StyledTableCell>SL No.</StyledTableCell>
                        <StyledTableCell>Board Name</StyledTableCell>
                        <StyledTableCell> Total</StyledTableCell>
                      </StyledTableRow>
                    </TableHead>
                    <TableBody>
                      {boardWiseDue?.map((obj, i) => {
                        return (
                          <StyledTableRow key={i}>
                            <StyledTableCell>{i + 1}</StyledTableCell>
                            <StyledTableCell>
                              {obj.board_unique_name}
                            </StyledTableCell>
                            <TableCell
                              sx={{
                                fontSize: 14,
                                border: "1px solid #DCDCDC",
                                textAlign: "right",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                navigate(`/paid-at-board-school-wise`, {
                                  state: obj.board_unique_id,
                                })
                              }
                            >
                              <span style={{ color: "#0000FF" }}>
                                {obj.balance}
                              </span>
                            </TableCell>
                          </StyledTableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
export default PaidAtBoardReport;
