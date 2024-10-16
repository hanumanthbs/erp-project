import { useState, useEffect } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
  Font,
  Image,
} from "@react-pdf/renderer";
import axios from "../../../services/Api";
import { useParams } from "react-router-dom";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import RobotoBold from "../../../fonts/Roboto-Bold.ttf";
import RobotoItalic from "../../../fonts/Roboto-Italic.ttf";
import RobotoLight from "../../../fonts/Roboto-Light.ttf";
import RobotoRegular from "../../../fonts/Roboto-Regular.ttf";
import LetterheadImage from "../../../assets/aisait.jpg";

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
  pageLayout: { margin: 25 },

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
    marginTop: "-20px",
  },

  feetemplateTitle: {
    fontSize: 12,
    fontFamily: "Times-Roman",
    textAlign: "center",
    color: "white",
    backgroundColor: "#4A57A9",
    padding: 5,
    marginTop: 130,
  },

  templateData1: {
    width: "25%",
  },

  templateHeaders: {
    fontSize: 11,
    fontFamily: "Times-Roman",
    textAlign: "left",
    fontStyle: "bold",
  },

  templateValues: {
    fontSize: 10,
    fontFamily: "Times-Roman",
    textAlign: "left",
  },

  tableRowStyle: {
    flexDirection: "row",
  },

  thStyle: {
    fontSize: "11px",
    fontWeight: "bold",
    width: "40%",
    fontFamily: "Times-Roman",
    color: "#000000",
  },

  border: {
    border: "1px solid black",
    marginLeft: "100px",
    marginRight: "100px",
  },

  timeTableThHeaderStyleParticulars: {
    width: "40%",
    borderStyle: "double",
    borderTop: "1px solid black",
    borderBottom: "1px solid black",
    borderRight: "1px solid black",
    borderLeft: "1px solid black",
  },

  timeTableThHeaderStyleTotalParticulars: {
    width: "60%",
    borderStyle: "double",
    borderTop: "1px solid black",
    borderBottom: "1px solid black",
    borderRight: "1px solid black",
    borderLeft: "1px solid black",
  },

  timeTableThHeaderStyleParticularsBoard: {
    width: "20%",
    borderStyle: "double",
    borderTop: "1px solid black",
    borderBottom: "1px solid black",
    borderRight: "1px solid black",
    borderLeft: "1px solid black",
  },

  timeTableThHeaderStyleParticulars1: {
    width: "20%",
    borderStyle: "double",
    borderTop: "1px solid black",
    borderBottom: "1px solid black",
    borderRight: "1px solid black",
    borderLeft: "1px solid black",
  },

  timeTableTotal: {
    width: "20%",
    borderStyle: "double",
    borderTop: "1px solid black",
    borderBottom: "1px solid black",
    borderRight: "1px solid black",
    borderLeft: "1px solid black",
  },

  timeTableThHeaderTotal: {
    width: "20%",
    borderStyle: "double",
    borderTop: "1px solid black",
    borderBottom: "1px solid black",
    borderRight: "1px solid black",
    borderLeft: "1px solid black",
  },

  timeTableThHeaderAllTotal: {
    width: "20%",
    borderStyle: "double",
    borderTop: "1px solid black",
    borderBottom: "1px solid black",
    borderRight: "1px solid black",
    borderLeft: "1px solid black",
  },

  timeTableThHeaderStyle: {
    width: "20%",
    borderTop: "1px solid black",
    borderBottom: "1px solid black",
  },

  timeTableThStyle: {
    padding: "5px",
    fontFamily: "Times-Roman",
    textAlign: "right",
    fontSize: "10px",
  },
  timeTableThStyle1: {
    textAlign: "left",
    padding: "5px",
    fontFamily: "Times-Roman",
    fontSize: "10px",
  },
  timeTableThStyleTotal: {
    textAlign: "center",
    padding: "5px",
    fontFamily: "Times-Roman",
    fontSize: "12px",
  },
  timetableStyle: {
    display: "table",
    width: "100%",
    marginTop: "10px",
    border: "1px solid black",
  },
  amountInInr: {
    fontSize: 11,
    fontFamily: "Times-Roman",
    textAlign: "left",
    fontStyle: "bold",
    textAlign: "right",
    marginTop: "4px",
  },
  timetableStyleOne: {
    display: "table",
    width: "100%",
    marginTop: "136px",
    border: "1px solid black",
  },
  image: { position: "absolute", width: "100%" },
});
export const getImage = (employeeDocuments) => {
  try {
    if (!employeeDocuments || !employeeDocuments.school_name_short) {
      throw new Error("schoolShortName is not defined");
    }
    return require(`../../../assets/${employeeDocuments?.org_type?.toLowerCase()}${employeeDocuments?.school_name_short?.toLowerCase()}.jpg`);
  } catch (error) {
    console.error(
      "Image not found for schoolShortName:",
      employeeDocuments?.school_name_short,
      "Error:",
      error.message
    );
    return LetterheadImage;
  }
};
function PaymentVoucherPdf() {
  const [feeTemplateData, setFeeTemplateData] = useState({});
  const [noOfYears, setNoOfYears] = useState([]);
  const [feeTemplateSubAmountData, setFeeTemplateSubAmountData] = useState([]);
  const [remarks, setRemarks] = useState([]);
  const [addonData, setAddonData] = useState([]);
  const [uniqueFess, setUniqueFees] = useState([]);
  const [uniformNumber, setUniformNumber] = useState([]);
  const [addOnFeeTable, setAddonFeeTable] = useState([]);
  const [uniformTable, setUniformTable] = useState([]);

  const { id } = useParams();
  const setCrumbs = useBreadcrumbs();

  useEffect(() => {
    getData();
    setCrumbs([{ name: "Feetemplate Master", link: "/FeetemplateMaster" }]);
  }, []);

  const getData = async () => {
    try {
      const templateResponse = await axios.get(
        `/api/finance/FetchAllFeeTemplateDetail/${id}`
      );
      const templateData = templateResponse.data.data[0];
      setRemarks(templateResponse.data.data[0].remarks);
      setFeeTemplateData(templateData);

      axios
        .get(
          `/api/academic/FetchAcademicProgram/${templateData.ac_year_id}/${templateData.program_id}/${templateData.school_id}`
        )
        .then((res) => {
          const yearSem = [];

          if (templateData.program_type_name.toLowerCase() === "yearly") {
            for (let i = 1; i <= res.data.data[0].number_of_semester; i++) {
              yearSem.push({ key: i, value: "Sem " + i });
            }
          } else if (
            templateData.program_type_name.toLowerCase() === "semester"
          ) {
            for (let i = 1; i <= res.data.data[0].number_of_semester; i++) {
              yearSem.push({ key: i, value: "Sem " + i });
            }
          }

          setNoOfYears(yearSem);
        })
        .catch((err) => console.error(err));

      const addonRes = await axios.get(
        `/api/otherFeeDetails/getOtherFeeDetailsData1?fee_template_id=${id}`
      );

      setAddonFeeTable(addonRes.data);

      const addOnResponse = await axios.get(
        `/api/otherFeeDetails/getOtherFeeDetailsData?schoolId=${templateResponse.data.data[0].school_id}&acYearId=${templateResponse.data.data[0].ac_year_id}&programId=${templateResponse.data.data[0].program_id}&programSpecializationId=${templateResponse.data.data[0].program_specialization_id}`
      );

      setAddonData(addOnResponse);

      const addOnFeeResponse = addOnResponse.data.filter(
        (obj) => obj.feetype === "Add-on Programme Fee"
      );

      const uniformResponse = addOnResponse.data.filter(
        (obj) => obj.feetype === "Uniform And Stationery Fee"
      );
      setUniformTable(uniformResponse);

      setUniformNumber([]);
      //Fee template Subamount data

      await axios
        .get(`/api/finance/FetchFeeTemplateSubAmountDetail/${id}`)
        .then((res) => {
          setFeeTemplateSubAmountData(res.data.data);
        })
        .catch((err) => console.error(err));
    } catch (error) {
      console.error(error);
    }
  };

  const rowTotal = (uniformNumber) => {
    let total = 0;
    noOfYears.forEach((obj) => {
      total += uniqueFess[uniformNumber]
        .map((obj1) => obj1["sem" + obj.key])
        .reduce((a, b) => a + b);
    });
    return total;
  };

  const totalSum = addOnFeeTable.reduce((total, program) => {
    return (
      total +
      noOfYears.reduce((sum, sem) => {
        return sum + (program[`sem${sem.key}`] || 0);
      }, 0)
    );
  }, 0);

  const feeTemplateTitle = () => {
    return (
      <>
        <View>
          <Text style={styles.feetemplateTitle}>Fee Template</Text>
        </View>
      </>
    );
  };

  const feetemplateData = () => {
    return (
      <>
        <View style={{ display: "flex" }}>
          <View style={{ flexDirection: "row", marginTop: 5 }}>
            <View style={styles.templateData1}>
              <Text style={styles.templateHeaders}>Academic Year </Text>
            </View>
            <View style={styles.templateData1}>
              <Text style={styles.templateValues}>
                {feeTemplateData?.ac_year}
              </Text>
            </View>
            <View style={styles.templateData1}>
              <Text style={styles.templateHeaders}>Template Name</Text>
            </View>
            <View style={styles.templateData1}>
              <Text style={styles.templateValues}>
                {feeTemplateData?.fee_template_name}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", marginTop: 5 }}>
            <View style={styles.templateData1}>
              <Text style={styles.templateHeaders}>Paid At Board </Text>
            </View>
            <View style={styles.templateData1}>
              <Text style={styles.templateValues}>
                {feeTemplateData?.Is_paid_at_board ? "Yes" : "No"}
              </Text>
            </View>
            <View style={styles.templateData1}>
              <Text style={styles.templateHeaders}>School</Text>
            </View>
            <View style={styles.templateData1}>
              <Text style={styles.templateValues}>
                {feeTemplateData?.school_name_short}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", marginTop: 5 }}>
            <View style={styles.templateData1}>
              <Text style={styles.templateHeaders}>Program</Text>
            </View>
            <View style={styles.templateData1}>
              <Text style={styles.templateValues}>
                {feeTemplateData?.program_short_name}
              </Text>
            </View>
            <View style={styles.templateData1}>
              <Text style={styles.templateHeaders}>Specialization</Text>
            </View>
            <View style={styles.templateData1}>
              <Text style={styles.templateValues}>
                {feeTemplateData?.program_specialization}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", marginTop: 5 }}>
            <View style={styles.templateData1}>
              <Text style={styles.templateHeaders}>Currency</Text>
            </View>
            <View style={styles.templateData1}>
              <Text style={styles.templateValues}>
                {feeTemplateData?.currency_type_name}
              </Text>
            </View>
            <View style={styles.templateData1}>
              <Text style={styles.templateHeaders}>Fee Collection Pattern</Text>
            </View>
            <View style={styles.templateData1}>
              <Text style={styles.templateValues}>
                {feeTemplateData?.program_type_name}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", marginTop: 5 }}>
            <View style={styles.templateData1}>
              <Text style={styles.templateHeaders}>Admission Category</Text>
            </View>
            <View style={styles.templateData1}>
              <Text style={styles.templateValues}>
                {feeTemplateData?.fee_admission_category_short_name}{" "}
              </Text>
            </View>
            <View style={styles.templateData1}>
              <Text style={styles.templateHeaders}>Admission Sub Category</Text>
            </View>
            <View style={styles.templateData1}>
              <Text style={styles.templateValues}>
                {feeTemplateData?.fee_admission_sub_category_name}
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  };

  const timeTableHeader = () => {
    return (
      <View style={{ backgroundColor: "#bdd7ff" }}>
        <View style={styles.tableRowStyle} fixed>
          <View style={styles.timeTableThHeaderStyleParticulars}>
            <Text style={styles.timeTableThStyle1}>Particulars</Text>
          </View>

          {feeTemplateData?.Is_paid_at_board ? (
            <View style={styles.timeTableThHeaderStyleParticularsBoard}>
              <Text style={styles.timeTableThStyle1}>Board</Text>
            </View>
          ) : (
            <></>
          )}

          {noOfYears.map((obj, i) => {
            if (
              feeTemplateSubAmountData?.[0]?.["fee_year" + obj.key + "_amt"] >
                0 &&
              feeTemplateData.program_type_name === "Yearly"
            ) {
              return (
                <View style={styles.timeTableThHeaderStyleParticulars1} key={i}>
                  <Text style={styles.timeTableThStyle}>{obj.value}</Text>
                </View>
              );
            } else {
              return (
                <View style={styles.timeTableThHeaderStyleParticulars1} key={i}>
                  <Text style={styles.timeTableThStyle}>{obj.value}</Text>
                </View>
              );
            }
          })}
          <View style={styles.timeTableThHeaderStyleParticulars1}>
            <Text style={styles.timeTableThStyleTotal}>Total</Text>
          </View>
        </View>
      </View>
    );
  };

  const timeTableBody = () => {
    return (
      <>
        {feeTemplateSubAmountData.map((obj, i) => {
          return (
            <View style={styles.tableRowStyle} key={i}>
              <View style={styles.timeTableThHeaderStyleParticulars}>
                <Text style={styles.timeTableThStyle1}>{obj.voucher_head}</Text>
              </View>

              {feeTemplateData?.Is_paid_at_board ? (
                <View style={styles.timeTableThHeaderStyleParticularsBoard}>
                  <Text style={styles.timeTableThStyle1}>
                    {obj.board_unique_short_name}
                  </Text>
                </View>
              ) : (
                <></>
              )}

              {noOfYears.map((obj1, j) => {
                if (
                  feeTemplateSubAmountData?.[i]?.[
                    "fee_year" + obj1.key + "_amt"
                  ] > 0 &&
                  feeTemplateData.program_type_name === "Yearly"
                ) {
                  return (
                    <>
                      <View
                        style={styles.timeTableThHeaderStyleParticulars1}
                        key={j}
                      >
                        <Text style={styles.timeTableThStyle}>
                          {obj["year" + obj1.key + "_amt"]}
                        </Text>
                      </View>
                    </>
                  );
                } else {
                  return (
                    <>
                      <View
                        style={styles.timeTableThHeaderStyleParticulars1}
                        key={j}
                      >
                        <Text style={styles.timeTableThStyle}>
                          {obj["year" + obj1.key + "_amt"]}
                        </Text>
                      </View>
                    </>
                  );
                }
              })}

              <View style={styles.timeTableThHeaderStyleParticulars1}>
                <Text style={styles.timeTableThStyle}>{obj.total_amt}</Text>
              </View>
            </View>
          );
        })}
        <View style={{ backgroundColor: "#bdd7ff" }}>
          <View style={styles.tableRowStyle}>
            <View
              style={
                feeTemplateData?.Is_paid_at_board
                  ? styles.timeTableThHeaderStyleTotalParticulars
                  : styles.timeTableThHeaderStyleParticulars
              }
            >
              <Text style={styles.timeTableThStyle1}>Total</Text>
            </View>

            {noOfYears.map((obj, i) => {
              if (
                feeTemplateSubAmountData?.[0]?.["fee_year" + obj.key + "_amt"] >
                  0 &&
                feeTemplateData.program_type_name === "Yearly"
              ) {
                return (
                  <View
                    style={
                      feeTemplateData?.Is_paid_at_board
                        ? styles.timeTableThHeaderAllTotal
                        : styles.timeTableThHeaderStyleParticulars1
                    }
                    key={i}
                  >
                    <Text style={styles.timeTableThStyle}>
                      {feeTemplateSubAmountData.length > 0 ? (
                        feeTemplateSubAmountData[0][
                          "fee_year" + obj.key + "_amt"
                        ]
                      ) : (
                        <></>
                      )}
                    </Text>
                  </View>
                );
              } else {
                return (
                  <View
                    style={
                      feeTemplateData?.Is_paid_at_board
                        ? styles.timeTableThHeaderAllTotal
                        : styles.timeTableThHeaderStyleParticulars1
                    }
                    key={i}
                  >
                    <Text style={styles.timeTableThStyle}>
                      {feeTemplateSubAmountData.length > 0 ? (
                        feeTemplateSubAmountData[0][
                          "fee_year" + obj.key + "_amt"
                        ]
                      ) : (
                        <></>
                      )}
                    </Text>
                  </View>
                );
              }
            })}

            <View
              style={
                feeTemplateData?.Is_paid_at_board
                  ? styles.timeTableThHeaderTotal
                  : styles.timeTableThHeaderStyleParticulars1
              }
            >
              <Text style={styles.timeTableThStyle}>
                {feeTemplateData.fee_year_total_amount}
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  };

  const timeTableHeaderAddon = () => {
    return (
      <>
        {addOnFeeTable.length > 0 ? (
          <View style={{ backgroundColor: "#bdd7ff" }}>
            <View style={styles.tableRowStyle} fixed>
              <View style={styles.timeTableThHeaderStyleParticulars}>
                <Text style={styles.timeTableThStyle1}>Particulars</Text>
              </View>

              {noOfYears.map((obj, i) => {
                return (
                  <View
                    style={styles.timeTableThHeaderStyleParticulars1}
                    key={i}
                  >
                    <Text style={styles.timeTableThStyle}>{obj.value}</Text>
                  </View>
                );
              })}
              <View style={styles.timeTableThHeaderStyleParticulars1}>
                <Text style={styles.timeTableThStyleTotal}>Total</Text>
              </View>
            </View>
          </View>
        ) : (
          <></>
        )}
      </>
    );
  };

  const timeTableBodyAddon = () => {
    return (
      <>
        {addOnFeeTable.length > 0 ? (
          <>
            <View style={styles.tableRowStyle}>
              <View style={styles.timeTableThHeaderStyleParticulars}>
                <Text style={styles.timeTableThStyle1}>
                  Add-on Programme Fee
                </Text>
              </View>
              {noOfYears.map((obj1, i) => {
                return (
                  <>
                    <View
                      style={styles.timeTableThHeaderStyleParticulars1}
                      key={i}
                    >
                      <Text style={styles.timeTableThStyle}>
                        {addOnFeeTable.reduce((sum, program) => {
                          return sum + (program[`sem${obj1.key}`] || 0);
                        }, 0)}
                      </Text>
                    </View>
                  </>
                );
              })}
              <View style={styles.timeTableThHeaderStyleParticulars1}>
                <Text style={styles.timeTableThStyle}>{totalSum}</Text>
              </View>
            </View>
          </>
        ) : (
          ""
        )}
      </>
    );
  };

  const remarksFooter = () => {
    return (
      <>
        <View>
          <Text style={{ fontSize: 12, fontFamily: "Times-Roman" }}>
            Note : {remarks}
          </Text>
        </View>
      </>
    );
  };

  return (
    <>
      <PDFViewer style={styles.viewer}>
        <Document title="Fee Template">
          <Page size="A4">
            <View style={styles.image}>
              <Image src={getImage(feeTemplateData)} />
            </View>
            <View style={styles.pageLayout}>
              <View>{feeTemplateTitle()}</View>
              <View>{feetemplateData()}</View>

              <View style={{ alignItems: "center" }}>
                <View style={styles.timetableStyle}>
                  {timeTableHeader()}
                  {timeTableBody()}
                </View>
              </View>
              {addOnFeeTable.length > 0 &&
              feeTemplateData?.currency_type_name === "USD" ? (
                <View>
                  <Text style={styles.amountInInr}>Amount in INR</Text>
                </View>
              ) : (
                <></>
              )}

              {addOnFeeTable.length > 0 ? (
                <View style={{ alignItems: "center" }}>
                  <View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Times-Roman",
                        textAlign: "center",
                        marginTop: 10,
                      }}
                    >
                      Add On Programme Fee
                    </Text>
                  </View>
                  <View
                    style={
                      // feeTemplateSubAmountData.length > 9
                      //   ? styles.timetableStyleOne
                      styles.timetableStyle
                    }
                  >
                    {timeTableHeaderAddon()}
                    {timeTableBodyAddon()}
                  </View>
                </View>
              ) : (
                <></>
              )}

              <View style={{ marginTop: 10 }}>{remarksFooter()}</View>
            </View>
          </Page>
        </Document>
      </PDFViewer>
    </>
  );
}

export default PaymentVoucherPdf;
