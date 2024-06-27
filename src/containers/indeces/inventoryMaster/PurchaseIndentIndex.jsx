import { useState, useEffect } from "react";
import { Box, Button, Grid, IconButton } from "@mui/material";
import GridIndex from "../../../components/GridIndex";
import AddIcon from "@mui/icons-material/Add";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useNavigate } from "react-router-dom";
import CustomModal from "../../../components/CustomModal";
import axios from "../../../services/Api";
import moment from "moment";

function PurchaseIndentIndex() {
  const [rows, setRows] = useState([]);
  const [modalContent, setModalContent] = useState({
    title: "",
    buttons: [],
  });
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();

  const columns = [
    { field: "itemDescription", headerName: "Item", flex: 1 },
    { field: "quantity", headerName: "Qty", flex: 1 },
    { field: "approxRate", headerName: "Approx rate", flex: 1 },
    { field: "ledger_name", headerName: "Total Value", flex: 1, hide: true },
    { field: "vendorName", headerName: "Vendor", flex: 1 },
    { field: "vendorContactNo", headerName: "Vendor No.", flex: 1 },
    {
      field: "createdDate",
      headerName: "Indent Date",
      flex: 1,
      type: "date",
      valueGetter: (params) =>
        params.row.createdDate
          ? moment(params.row.createdDate).format("DD-MM-YYYY")
          : "NA",
    },
    { field: "createdUserName", headerName: "Created By", flex: 1 },
    {
      field: "approvedDate",
      headerName: "Approved Date",
      flex: 1,
      type: "date",
      valueGetter: (params) =>
        params.row.createdDate
          ? moment(params.row.createdDate).format("DD-MM-YYYY")
          : "NA",
    },
    { field: "approvedBy", headerName: "Approved By", flex: 1 },
  ];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    await axios
      .get(`/api/purchaseIndent/getAllPurchaseIndent`)
      .then((Response) => {
        const rowId = Response.data.data.map((obj, index) => ({
          ...obj,
          id: index + 1,
        }));
        setRows(rowId.reverse());
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <CustomModal
        open={modalOpen}
        setOpen={setModalOpen}
        title={modalContent.title}
        message={modalContent.message}
        buttons={modalContent.buttons}
      />

      <Box sx={{ position: "relative", mt: 4 }}>
        <Grid
          container
          justifycontents="flex-start"
          alignItems="center"
          rowSpacing={2}
        >
          <Grid item xs={12}>
            <GridIndex rows={rows} columns={columns} />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default PurchaseIndentIndex;