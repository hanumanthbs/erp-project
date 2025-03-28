import { useState, useEffect } from "react";
import {
  Page,
  Text,
  View,
  Image,
  Document,
  StyleSheet,
  PDFViewer,
  Font,
} from "@react-pdf/renderer";
import axios from "../../../services/Api";
import { useParams } from "react-router-dom";
import numberToWords from "number-to-words";
import { useLocation } from "react-router-dom";
import moment from "moment";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import RobotoBold from "../../../fonts/Roboto-Bold.ttf";
import RobotoItalic from "../../../fonts/Roboto-Italic.ttf";
import RobotoLight from "../../../fonts/Roboto-Light.ttf";
import RobotoRegular from "../../../fonts/Roboto-Regular.ttf";
import ado_sign from "../../../assets/ADO_PO_Sign.png";

// Register the Arial font
Font.register({
  family: "Roboto",
  fonts: [
    { src: RobotoBold, fontStyle: "bold", fontWeight: 700 },
    { src: RobotoItalic, fontStyle: "italic", fontWeight: 200 },
    { src: RobotoLight, fontStyle: "light", fontWeight: 300 },
    { src: RobotoRegular, fontStyle: "normal" },
  ],
});

const styles = StyleSheet.create({
  viewer: {
    width: window.innerWidth,
    height: window.innerHeight,
  },

  pageLayout: {
    fontFamily: "Roboto",
    margin: 25,
  },

  image: { position: "absolute", width: "100%" },
  container: {
    width: "100%",
    border: "1px solid black",
    display: "flex",
    justifyContent: "center",
    marginTop: "130px",
  },

  layout: { margin: "80px 25px 20px 25px" },

  bodyContainer: {
    width: "100%",
    height: "230px",
    border: "0.5px solid #000",
    display: "flex",
    justifyContent: "center",
  },

  table: {
    border: "1px solid black",
    width: "540px",
    height: "auto",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 14,
    fontFamily: "Times-Roman",
    borderBottom: "1px solid black",
  },

  paymentVoucher: {
    fontSize: 12,
    fontFamily: "Times-Roman",

    fontWeight: 600,
  },

  address: {
    width: "49.3%",
    borderRight: "1px solid black",
    padding: "5px",
  },

  vendorDetails: {
    width: "50%",
    // padding: "7px",
    padding: "5px",
  },

  addressone: {
    fontSize: 10,
    fontFamily: "Times-Roman",
  },

  addressoneschool: {
    fontSize: 10,
    fontFamily: "Times-Bold",
  },

  addresstwo: {
    width: "49.3%",
    borderRight: "1px solid black",
    padding: "5px",
    borderTop: "1px solid black",
  },

  addresstwoNames: {
    fontSize: 10,
    fontFamily: "Times-Roman",
  },

  addresstwoNamesVendor: {
    fontSize: 10,
    fontFamily: "Times-Bold",
  },

  bankDetails: {
    fontSize: 10,
    fontFamily: "Times-Roman",
    marginTop: "10px",
  },
  remarksValue: {
    fontSize: 10,
    fontFamily: "Times-Roman",
  },

  date: {
    width: "50.7%",
  },

  dateone: {
    fontSize: 10,
    fontFamily: "Times-Roman",
    // textAlign: "center",
    borderBottom: "1px solid black",
    padding: "5px",
  },

  store: {
    width: "50.7%",
    borderRight: "1px solid black",
    fontSize: 10,
    fontFamily: "Times-Roman",
    // padding: "15px",
    padding: "5px",
  },

  destination: {
    width: "50.7%",
    // borderRight: "1px solid black",
    fontSize: 10,
    fontFamily: "Times-Roman",
    // padding: "15px",
    padding: "5px",
  },

  // storeName: {
  //   fontSize: 10,
  //   fontFamily: "Times-Roman",
  //   // padding: "15px",
  //   padding: "5px",
  // },

  quotation: {
    width: "50.7%",
    borderTop: "1px solid black",
    // padding: "10px",
    padding: "5px",
  },

  quotationName: {
    fontSize: 10,
    fontFamily: "Times-Roman",
  },

  otherRefernce: {
    width: "50.7%",
    borderRight: "1px solid black",
    borderTop: "1px solid black",
    // padding: "10px",
    padding: "5px",
  },

  termsandconditions: {
    // padding: "2px",
    borderTop: "1px solid black",
    padding: "5px",
  },
  termsandconditionsName: {
    fontSize: 10,
    fontFamily: "Times-Roman",
    marginTop: "5px",
  },

  termsandconditionsNameBody: {
    fontSize: 10,
    fontFamily: "Times-Roman",
    marginTop: "5px",
    lineHeight: 1.25,
  },

  tableRowStyle: {
    flexDirection: "row",
  },

  Total: {
    fontSize: 10,
    fontFamily: "Times-Roman",
    width: "81.7%",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
  },

  Amount: {
    borderBottom: "1px solid black",
  },

  timeTableThHeaderStyle: {
    width: "10%",
    borderTop: "1px solid black",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
    color: "black",
  },

  seriolNoHeader: {
    width: "7%",
    borderTop: "1px solid black",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
    color: "black",
  },

  itemNameHeader: {
    width: "40%",
    borderTop: "1px solid black",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
    color: "black",
  },

  quantityHeader: {
    width: "7%",
    borderTop: "1px solid black",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
    color: "black",
  },

  uomHeader: {
    width: "8%",
    borderTop: "1px solid black",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
    color: "black",
  },

  rateHeader: {
    width: "10%",
    borderTop: "1px solid black",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
    color: "black",
    textAlign: "center",
  },

  gstHeader: {
    width: "8.5%",
    borderTop: "1px solid black",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
    color: "black",
  },

  discountHeader: {
    width: "9%",
    borderTop: "1px solid black",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
    color: "black",
  },

  timeTableThStyle: {
    textAlign: "center",
    padding: "5px",
    fontFamily: "Times-Bold",
    fontStyle: "bold",
    fontSize: 10,
  },

  timeTableThStyleAmount: {
    textAlign: "center",
    padding: "5px",
    fontFamily: "Times-Bold",
    fontSize: "9px",
    textAlign: "right",
  },

  timeTableTdHeaderStyle1: {
    width: "10%",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
  },

  seriolNo: {
    width: "7%",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
  },

  quantity: {
    width: "7%",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
  },

  uom: {
    width: "8%",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
  },

  itemName: {
    width: "40%",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
  },

  timeTableTdStyle: {
    textAlign: "center",
    padding: "5px",
    fontFamily: "Times-Roman",
    fontSize: 9.5,
  },

  timeTableTdStyleItem: {
    textAlign: "left",
    padding: "5px",
    fontFamily: "Times-Roman",
    fontSize: 9.5,
  },

  timeTableTdStyleAmount: {
    textAlign: "center",
    padding: "5px",
    fontFamily: "Times-Roman",
    fontSize: "10px",
  },

  timeTableTdStyleMainAmount: {
    textAlign: "right",
    padding: "5px",
    fontFamily: "Times-Roman",
    fontSize: "10px",
  },

  timeTableTdStyleCost: {
    textAlign: "right",
    padding: "5px",
    fontFamily: "Times-Roman",
    fontSize: "10px",
  },

  amount: {
    width: "10%",

    borderBottom: "1px solid black",
  },

  rate: {
    width: "10%",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
  },

  gst: {
    width: "8.5%",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
  },

  discount: {
    width: "9%",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
  },

  amountHeader: {
    width: "10%",
    borderTop: "1px solid black",

    borderBottom: "1px solid black",
    color: "black",
  },
});

function PoPdf() {
  const [data, setData] = useState([]);
  const [ip, setIp] = useState([]);
  const [schoolName, setSchoolName] = useState("");
  const [schoolFullName, setSchoolFullName] = useState("");
  const [total, setTotal] = useState();
  const [costValue, setCostValue] = useState();
  const [qtyTotal, setQtyTotal] = useState();
  const [gstValue, setGstValue] = useState();
  const [discValue, setDiscValue] = useState();

  const { id } = useParams();
  const setCrumbs = useBreadcrumbs();
  const location = useLocation();

  useEffect(() => {
    getData();
    setCrumbs([{ name: "Purchase Order", link: "/PoMaster" }]);
  }, []);

  useEffect(() => {
    const temp = data?.temporaryPurchseOrder?.temporaryPurchaseItems?.reduce(
      (a, b) => a + b.totalAmount,
      0
    );
    setTotal(temp);

    const costTotal =
      data?.temporaryPurchseOrder?.temporaryPurchaseItems?.reduce(
        (a, b) => Number(a) + Number(b.costTotal),
        0
      );

    setCostValue(costTotal);

    const gstTotal =
      data?.temporaryPurchseOrder?.temporaryPurchaseItems?.reduce(
        (a, b) => Number(a) + Number(b.gstTotal),
        0
      );

    setGstValue(gstTotal);

    const discTotal =
      data?.temporaryPurchseOrder?.temporaryPurchaseItems?.reduce(
        (a, b) => Number(a) + Number(b.discountTotal),
        0
      );

    setDiscValue(discTotal);

    const quantityTotal =
      data?.temporaryPurchseOrder?.temporaryPurchaseItems?.reduce(
        (a, b) => Number(a) + Number(b.quantity),
        0
      );
    setQtyTotal(quantityTotal);
  }, [data]);

  const getData = async () => {
    const response = await fetch("https://api.ipify.org?format=json");
    const responseData = await response.json();
    await axios
      .get(`/api/purchase/getPurchaseOrderById?id=${id}`)
      .then((res) => {
        setData(res.data.data);
        setIp(responseData?.ip);
        getSchoolData(res.data.data.purchaseOrder.instituteId);
      })
      .catch((error) => console.error(error));
  };

  const getSchoolData = async (instituteId) => {
    await axios
      .get(`/api/institute/school`)
      .then((res) => {
        res.data.data.filter((obj) => {
          if (obj.school_id === instituteId) {
            setSchoolName(obj.school_name_short);
            setSchoolFullName(obj.school_name);
          }
        });
      })
      .catch((err) => console.error(err));
  };

  const timeTableTitle = () => {
    return (
      <>
        <View style={{ textAlign: "center" }}>
          <Text style={{ fontStyle: "Times-bold" }}>
            PURCHASE ORDER - {data?.purchaseOrder?.requestType}
          </Text>
        </View>
      </>
    );
  };

  const address = () => {
    return (
      <>
        <View style={{ flexDirection: "row", display: "flex" }}>
          <View style={styles.address}>
            <Text style={styles.addressone}>Invoice To:</Text>
            <Text style={styles.addressoneschool}>{schoolFullName ?? ""}</Text>
            <Text style={styles.addressone}>
              Acharya Dr, Acharya Dr Sarvepalli Radhakrishnan Rd, Acharya P.O,
              Soladevanahalli
            </Text>
            <Text style={styles.addressone}>Bangalore - 560107</Text>
            <Text style={styles.addressone}>State Name: Karnataka {"   "}</Text>
            <Text style={styles.addressone}>
              Email-Id: purchase@acharya.ac.in
            </Text>
          </View>

          <View style={{ ...styles.date }}>
            <View style={{ ...styles.dateone }}>
              <Text>PO No. :</Text>
              <Text style={{ marginTop: "2px", fontFamily: "Times-Bold" }}>
                {data?.purchaseOrder?.poReferenceNo}
              </Text>
            </View>

            <View
              style={{ display: "flex", flexDirection: "row", height: "55px" }}
            >
              <View style={{ ...styles.store }}>
                <Text>Date :</Text>
                <Text style={{ marginTop: "2px", fontFamily: "Times-Bold" }}>
                  {moment(data?.approvedDate?.date).format("DD-MM-YYYY")}{" "}
                </Text>
              </View>
              <View style={{ ...styles.destination }}>
                <Text>Quotation No. :</Text>
                <Text style={{ marginTop: "2px", fontFamily: "Times-Bold" }}>
                  {data?.purchaseOrder?.quotationNo}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </>
    );
  };

  const addresstwo = () => {
    return (
      <>
        <View style={{ flexDirection: "row", display: "flex" }}>
          <View style={styles.addresstwo}>
            <Text style={styles.addresstwoNames}>Supplier :</Text>

            <Text style={styles.addresstwoNamesVendor}>
              {data?.vendor?.vendor_name}
            </Text>
            <Text style={styles.addresstwoNames}>
              {data?.vendor?.street_name}
            </Text>
            <Text style={styles.addresstwoNames}>{data?.vendor?.area}</Text>
            <Text style={styles.addresstwoNames}>
              {data?.vendor?.city_name} , {data?.vendor?.state_name} -{" "}
              {data?.vendor?.pin_code}
            </Text>
            <Text style={styles.addresstwoNames}>
              GST No. : {data?.vendor?.vendor_gst_no}
            </Text>
            <Text style={styles.addresstwoNames}>
              Email Id : {data?.vendor?.vendor_email}
            </Text>
            <Text style={styles.addresstwoNames}>
              Ph No. : {data?.vendor?.vendor_contact_no}
            </Text>
            <Text style={styles.addresstwoNames}>
              PAN No. : {data?.vendor?.pan_number}
            </Text>

            <Text
              style={{
                fontSize: 11,
                fontFamily: "Times-Roman",
                marginTop: "10px",
              }}
            >
              Kind Attention :{" "}
              {data?.vendor?.vendor_address
                ? `Mr/Ms. ${data?.vendor?.vendor_address}`
                : ""}
            </Text>
          </View>

          <View style={styles.date}>
            <View style={{ flexDirection: "row" }}>
              <View style={styles.otherRefernce}>
                <Text style={{ ...styles.quotationName }}>
                  Other References :
                </Text>
                <Text
                  style={{
                    ...styles.quotationName,
                    marginTop: "2px",
                    textTransform: "capitalize",
                    fontFamily: "Times-Bold",
                  }}
                >
                  {data?.purchaseOrder?.otherReference}
                </Text>
              </View>
              <View style={styles.quotation}>
                <Text style={styles.quotationName}>Payment Type :</Text>
                <Text
                  style={{
                    ...styles.quotationName,
                    marginTop: "2px",
                    fontFamily: "Times-Bold",
                  }}
                >
                  {data?.purchaseOrder?.accountPaymentType}
                </Text>
              </View>
            </View>
            <View style={styles.termsandconditions}>
              <Text style={styles.termsandconditionsName}>
                Terms and conditions :
              </Text>
              <Text style={styles.termsandconditionsNameBody}>
                {data?.purchaseOrder?.termsAndConditions}
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  };

  const VendorDetails = () => {
    return (
      <>
        <View style={{ flexDirection: "row", display: "flex" }}>
          <View style={styles.vendorDetails}>
            <Text style={styles.addresstwoNames}>
              Amount in Words :{" "}
              {total !== undefined && total !== null
                ? numberToWords.toWords(Math.round(total))
                : ""}{" "}
            </Text>
            <Text style={styles.addresstwoNames}></Text>
            <Text style={{ ...styles.bankDetails, fontFamily: "Times-Bold" }}>
              Bank Details
            </Text>
            <Text style={styles.addresstwoNames}>
              Account Holder Name :{" "}
              {data?.vendor?.vendor_bank_account_holder_name}
            </Text>
            <Text style={styles.addresstwoNames}>
              Bank Name : {data?.vendor?.vendor_bank_name}
            </Text>
            <Text style={styles.addresstwoNames}>
              Account No. : {data?.vendor?.account_no}
            </Text>
            <Text style={styles.addresstwoNames}>
              Bank branch : {data?.vendor?.bank_branch}
            </Text>
            <Text style={styles.addresstwoNames}>
              Bank IFSC No. : {data?.vendor?.vendor_bank_ifsc_code}
            </Text>
            <Text style={{ ...styles.bankDetails, fontFamily: "Times-Bold" }}>
              Remarks :
            </Text>
            <Text style={styles.remarksValue}>
              {data.purchaseOrder?.remarks}
            </Text>
          </View>
          <View style={{ ...styles.vendorDetails }}>
            <View
              style={{
                flexDirection: "row",
                gap: 2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 9,
                  // fontFamily: "Times-Bold",
                  // textAlign: "right",
                }}
              >
                For
              </Text>
              <Text
                style={{
                  fontSize: 9,
                  fontFamily: "Times-Bold",
                  // textAlign: "right",
                }}
              >
                {schoolFullName.toUpperCase() ?? ""}
              </Text>
            </View>

            {data.purchaseOrder?.createdUsername?.toLowerCase() ==
              "manishkthakur" && (
              <View>
                <Image
                  src={ado_sign}
                  alt={ado_sign}
                  style={{ width: "100%", height: "80px" }}
                />
              </View>
            )}
            <View style={{ textAlign: "center" }}>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Times-Roman",
                  // textAlign: "justify",
                  marginTop:
                    `${data.purchaseOrder?.createdUsername?.toLowerCase()}` ==
                    "manishkthakur"
                      ? ""
                      : "60px",
                }}
              >
                Authorized Signatory
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Times-Roman",
                  // textAlign: "justify",
                  marginTop: "5px",
                }}
              >
                Name:{" "}
                {data.purchaseOrder
                  ? data.purchaseOrder.createdUsername.charAt(0).toUpperCase() +
                    data.purchaseOrder.createdUsername.slice(1).toLowerCase()
                  : ""}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Times-Roman",
                  // textAlign: "justify",
                  // marginTop: "50px",
                }}
              >
                IP Address: {ip} (
                {moment(data.purchaseOrder?.createdDate).format(
                  "DD-MM-YYYY h:mm a"
                )}
                )
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  };

  const timeTableHeader = () => {
    return (
      <>
        <View style={styles.tableRowStyle} fixed>
          <View style={styles.seriolNoHeader}>
            <Text style={styles.timeTableThStyle}>Sl No.</Text>
          </View>
          <View style={styles.itemNameHeader}>
            <Text style={styles.timeTableThStyle}>
              Goods Description / Service
            </Text>
          </View>

          <View style={styles.quantityHeader}>
            <Text style={styles.timeTableThStyle}>Qty</Text>
          </View>

          <View style={styles.uomHeader}>
            <Text style={styles.timeTableThStyle}>UOM</Text>
          </View>

          <View style={styles.rateHeader}>
            <Text style={styles.timeTableThStyle}>Rate</Text>
          </View>

          <View style={styles.timeTableThHeaderStyle}>
            <Text style={styles.timeTableThStyle}>Cost</Text>
          </View>

          <View style={styles.gstHeader}>
            <Text style={styles.timeTableThStyleAmount}>GST %</Text>
          </View>
          <View style={styles.discountHeader}>
            <Text style={styles.timeTableThStyleAmount}>DISC %</Text>
          </View>
          <View style={styles.amountHeader}>
            <Text style={styles.timeTableThStyleAmount}>Amount</Text>
          </View>
        </View>
      </>
    );
  };

  const timeTableBody = () => {
    return (
      <>
        {data?.purchaseOrder?.purchaseItems?.map((obj, i) => {
          return (
            <View style={styles.tableRowStyle} key={i}>
              <View style={styles.seriolNo}>
                <Text style={styles.timeTableTdStyle}>{i + 1}</Text>
              </View>
              <View style={styles.itemName}>
                <Text style={styles.timeTableTdStyleItem}>{obj.itemName}</Text>
              </View>
              <View style={styles.quantity}>
                <Text style={styles.timeTableTdStyleAmount}>
                  {obj.quantity}
                </Text>
              </View>

              <View style={styles.uom}>
                <Text style={styles.timeTableTdStyleAmount}>
                  {obj.itemName
                    ? obj.itemName.split("-")[
                        obj.itemName.split("-").length - 1
                      ]
                    : ""}
                </Text>
              </View>

              <View style={styles.rate}>
                <Text style={styles.timeTableTdStyleAmount}> {obj?.rate}</Text>
              </View>

              <View style={styles.timeTableTdHeaderStyle1}>
                <Text style={styles.timeTableTdStyleCost}>
                  {obj?.rate * obj?.quantity}
                </Text>
              </View>

              <View style={styles.gst}>
                <Text style={styles.timeTableTdStyleAmount}>
                  {obj?.gst ?? 0}
                </Text>
              </View>
              <View style={styles.discount}>
                <Text style={styles.timeTableTdStyleAmount}>
                  {obj?.discount ?? 0}
                </Text>
              </View>
              <View style={styles.amount}>
                <Text style={styles.timeTableTdStyleMainAmount}>
                  {Math.round(obj?.totalAmount)}
                </Text>
              </View>
            </View>
          );
        })}

        <View style={styles.tableRowStyle}>
          <View style={styles.seriolNo}>
            <Text style={styles.timeTableTdStyle}></Text>
          </View>
          <View style={styles.itemName}>
            <Text
              style={{
                textAlign: "center",
                padding: "5px",
                fontFamily: "Times-Roman",
                fontSize: 10,
              }}
            >
              Total
            </Text>
          </View>
          <View style={styles.quantity}>
            <Text style={styles.timeTableTdStyleAmount}>{qtyTotal}</Text>
          </View>

          <View style={styles.uom}>
            <Text style={styles.timeTableTdStyleAmount}></Text>
          </View>

          <View style={styles.rate}>
            <Text style={styles.timeTableTdStyleAmount}></Text>
          </View>

          <View style={styles.timeTableTdHeaderStyle1}>
            <Text style={styles.timeTableTdStyleCost}>
              {Math.round(costValue)}
            </Text>
          </View>

          <View style={styles.gst}>
            <Text style={styles.timeTableTdStyleAmount}></Text>
          </View>
          <View style={styles.discount}>
            <Text style={styles.timeTableTdStyleAmount}></Text>
          </View>
          <View style={styles.amount}>
            <Text style={styles.timeTableTdStyleMainAmount}>
              {Math.round(total)}
            </Text>
          </View>
        </View>
      </>
    );
  };

  const itemsCosts = () => {
    return (
      <>
        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              width: "6.4%",
              fontFamily: "Times-Roman",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
            }}
          >
            <Text></Text>
          </View>
          <View
            style={{
              width: "36.5%",
              fontFamily: "Times-Roman",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontFamily: "Times-Roman",
                fontSize: "10px",
              }}
            >
              Item Cost Total
            </Text>
          </View>

          <View
            style={{
              width: "48%",
              fontFamily: "Times-Roman",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontFamily: "Times-Roman",
                fontSize: "10px",
              }}
            ></Text>
          </View>

          <View
            style={{
              width: "9.1%",
              fontFamily: "Times-Roman",

              borderBottom: "1px solid black",
            }}
          >
            <Text
              style={{
                fontSize: "10px",
                fontFamily: "Times-Roman",
                padding: "1px",
                textAlign: "right",
                marginRight: "5px",
              }}
            >
              {Math.round(costValue)}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              width: "6.4%",
              fontFamily: "Times-Roman",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
            }}
          >
            <Text></Text>
          </View>
          <View
            style={{
              width: "36.5%",
              fontFamily: "Times-Roman",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontFamily: "Times-Roman",
                fontSize: "10px",
              }}
            >
              Disc Total
            </Text>
          </View>

          <View
            style={{
              width: "48%",
              fontFamily: "Times-Roman",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontFamily: "Times-Roman",
                fontSize: "10px",
              }}
            ></Text>
          </View>

          <View
            style={{
              width: "9.1%",
              fontFamily: "Times-Roman",

              borderBottom: "1px solid black",
            }}
          >
            <Text
              style={{
                fontSize: "10px",
                fontFamily: "Times-Roman",
                padding: "1px",
                textAlign: "right",
                marginRight: "5px",
              }}
            >
              {Math.round(discValue)}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              width: "6.4%",
              fontFamily: "Times-Roman",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
            }}
          >
            <Text></Text>
          </View>
          <View
            style={{
              width: "36.5%",
              fontFamily: "Times-Roman",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontFamily: "Times-Roman",
                fontSize: "10px",
              }}
            >
              Gst Total
            </Text>
          </View>

          <View
            style={{
              width: "48%",
              fontFamily: "Times-Roman",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontFamily: "Times-Roman",
                fontSize: "10px",
              }}
            ></Text>
          </View>

          <View
            style={{
              width: "9.1%",
              fontFamily: "Times-Roman",

              borderBottom: "1px solid black",
              padding: "1px",
            }}
          >
            <Text
              style={{
                fontSize: "10px",
                fontFamily: "Times-Roman",
                marginRight: "5px",
                textAlign: "right",
              }}
            >
              {Math.round(gstValue)}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              width: "6.4%",
              fontFamily: "Times-Roman",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
            }}
          >
            <Text></Text>
          </View>
          <View
            style={{
              width: "36.5%",
              fontFamily: "Times-Roman",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontFamily: "Times-Roman",
                fontSize: "10px",
              }}
            >
              Grand Total
            </Text>
          </View>

          <View
            style={{
              width: "48%",
              fontFamily: "Times-Roman",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontFamily: "Times-Roman",
                fontSize: "10px",
              }}
            ></Text>
          </View>

          <View
            style={{
              width: "9.1%",
              fontFamily: "Times-Roman",

              borderBottom: "1px solid black",
            }}
          >
            <Text
              style={{
                fontSize: "10px",
                fontFamily: "Times-Roman",
                padding: "1px",
                textAlign: "right",
                marginRight: "5px",
              }}
            >
              {Math.round(total)}
            </Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <>
      <PDFViewer style={styles.viewer}>
        <Document title="Purchase Order">
          <Page size="A4">
            <View style={styles.pageLayout}>
              {!location.state.letterHeadStatus && pdfRender(schoolName)}
              <View style={styles.container}>
                <View style={styles.title}>{timeTableTitle()}</View>
                <View>{address()}</View>
                <View>{addresstwo()}</View>
                <View>{timeTableHeader()}</View>
                <View>{timeTableBody()}</View>
                <View>{itemsCosts()}</View>
                <View>{VendorDetails()}</View>
              </View>
            </View>
          </Page>
        </Document>
      </PDFViewer>
    </>
  );
}

export default PoPdf;

const pdfRender = (schoolName) => {
  const logos = require.context("../../../assets", true);
  return (
    <>
      {schoolName !== "" ? (
        <Image
          style={styles.image}
          src={logos(`./ais${schoolName.toLowerCase()}.jpg`)}
        />
      ) : (
        <></>
      )}
    </>
  );
};
