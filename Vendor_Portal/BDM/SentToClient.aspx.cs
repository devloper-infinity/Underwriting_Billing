using ClosedXML.Excel;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using CrystalDecisions.Web;
using Spire.Xls;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using Vendor_Portal.App_Code;
using Vendor_Portal.App_Code.BLL;
using Excel = Microsoft.Office.Interop.Excel;

namespace Vendor_Portal.BDM
{
    public partial class SentToClient : System.Web.UI.Page
    {
        static string InvoiceNumber;
        static string GroupName;
        static string DomainId;
        static string ProcessName;
        static string filename;
        static string FileName;
        static Workbook book = new Workbook();
        static Worksheet sheet;
        public static string ReportFileName = "";
        public static string ReportFilePath = "";

        protected void Page_Load(object sender, EventArgs e)
        {

        }

        [WebMethod]
        public static string GetAllSentToClientList()
        {
            DataTable dt1 = new bllTracking().GetSentToClientList();
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            Dictionary<string, object> row;
            if (dt1 != null)
            {
                foreach (DataRow dr in dt1.Rows)
                {
                    row = new Dictionary<string, object>();
                    foreach (DataColumn col in dt1.Columns)
                    {
                        row.Add(col.ColumnName, dr[col]);
                    }
                    rows.Add(row);
                }
            }
            JavaScriptSerializer ser = new JavaScriptSerializer();
            ser.MaxJsonLength = int.MaxValue;
            return ser.Serialize(rows);
        }

        [WebMethod]
        public static int GenerateInvoice(int ProjectID, string BillingPeriod, string Slot, int InvoiceId)
        {
            int returnvalue = 0;
            DataTable dt = new bllTracking().GetProjectClientConfiguration(ProjectID, InvoiceId);
            if (dt != null)
            {
                string InvoiceConfig = dt.Rows[0]["InvoiceConfiguration"].ToString();
                InvoiceNumber = dt.Rows[0]["InvoiceNumber"].ToString();
                GroupName = Convert.ToString(dt.Rows[0]["ProjectName"]);
                DomainId = dt.Rows[0]["DomainId"].ToString();
                ProcessName = dt.Rows[0]["ClientProcess"].ToString();
                ReportDocument rpt = new ReportDocument();
                if (BillingPeriod != ProcessName && (ProjectID == 199 || ProjectID == 394))
                    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/PCQCSummary.rpt"));
                else if (Convert.ToString(dt.Rows[0]["Securitization"]) == "561")
                    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/Securitization561.rpt"));
                else if (Convert.ToString(dt.Rows[0]["Securitization"]) == "Yes")
                    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/Securitization.rpt"));
                else if (Convert.ToString(dt.Rows[0]["Securitization"]) == "Rebuttal")
                    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/Rebuttal.rpt"));
                else if (Convert.ToString(dt.Rows[0]["Securitization"]) == "Research")
                    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/Research.rpt"));
                else if (Convert.ToString(dt.Rows[0]["Securitization"]) == "Inventory")
                    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/Inventory.rpt"));
                else if (Convert.ToString(dt.Rows[0]["Securitization"]) == "642")
                    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/642.rpt"));
                else if (Convert.ToString(dt.Rows[0]["Securitization"]) == "670")
                    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/670.rpt"));
                else if (ProjectID == 70)
                    //rpt.Load("../Reports/NewSummaryReport1561.rpt");
                    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/NewSummaryReport1561.rpt"));
                else if (ProjectID == 512)
                    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/2091.rpt"));
                else if (ProjectID == 217)
                    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/NewSummaryReport1.rpt"));
                else
                    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/MergeBillingAll.rpt"));

                try
                {
                    CrystalDecisions.Shared.ParameterValues pval1 = new ParameterValues();
                    CrystalDecisions.Shared.ParameterValues pval2 = new ParameterValues();
                    CrystalDecisions.Shared.ParameterValues pval3 = new ParameterValues();
                    CrystalDecisions.Shared.ParameterValues pval4 = new ParameterValues();
                    CrystalDecisions.Shared.ParameterValues pval5 = new ParameterValues();
                    CrystalDecisions.Shared.ParameterValues pval6 = new ParameterValues();
                    CrystalDecisions.Shared.ParameterValues pval7 = new ParameterValues();

                    ParameterDiscreteValue pdisval2 = new ParameterDiscreteValue();
                    pdisval2.Value = GroupName;
                    pval2.Add(pdisval2);

                    ParameterDiscreteValue pdisval3 = new ParameterDiscreteValue();
                    pdisval3.Value = BillingPeriod;
                    pval3.Add(pdisval3);

                    ParameterDiscreteValue pdisval4 = new ParameterDiscreteValue();
                    if (BillingPeriod != ProcessName)
                        pdisval4.Value = ProcessName;
                    else
                        pdisval4.Value = "";
                    pval4.Add(pdisval4);

                    ParameterDiscreteValue pdisval5 = new ParameterDiscreteValue();
                    pdisval5.Value = ProjectID;
                    pval5.Add(pdisval5);

                    ParameterDiscreteValue pdisval6 = new ParameterDiscreteValue();
                    pdisval6.Value = InvoiceId;
                    pval6.Add(pdisval6);

                    ParameterDiscreteValue pdisval7 = new ParameterDiscreteValue();
                    if (Slot == "") Slot = "0";
                    pdisval7.Value = Convert.ToString(Convert.ToString(Slot));
                    pval7.Add(pdisval7);


                    rpt.DataDefinition.ParameterFields["@BillingPeriod"].ApplyCurrentValues(pval3);
                    try
                    {
                        rpt.DataDefinition.ParameterFields["@ProcessName"].ApplyCurrentValues(pval4);
                    }
                    catch { }
                    rpt.DataDefinition.ParameterFields["@ProjectId"].ApplyCurrentValues(pval5);
                    try
                    {
                        rpt.DataDefinition.ParameterFields["@InvoiceId"].ApplyCurrentValues(pval6);
                    }
                    catch { }

                    int chkSlot = new bllTracking().CheckSlotPassing(ProjectID, BillingPeriod, ProcessName);
                    try
                    {
                        if (chkSlot == 1)
                            rpt.DataDefinition.ParameterFields["@Slot"].ApplyCurrentValues(pval7);
                    }
                    catch { }

                    CrystalDecisions.CrystalReports.Engine.ReportDocument reportDocument = new CrystalDecisions.CrystalReports.Engine.ReportDocument();
                    CrystalDecisions.Shared.ConnectionInfo crConnectionInfo;
                    CrystalDecisions.Shared.TableLogOnInfos crtableLogoninfos;
                    CrystalDecisions.Shared.TableLogOnInfo crtableLogoninfo;
                    CrystalDecisions.CrystalReports.Engine.Tables CrTables;
                    crConnectionInfo = new CrystalDecisions.Shared.ConnectionInfo();
                    crtableLogoninfos = new CrystalDecisions.Shared.TableLogOnInfos();
                    crtableLogoninfo = new CrystalDecisions.Shared.TableLogOnInfo();

                    crConnectionInfo.ServerName = ConfigurationManager.AppSettings["ServerName"];
                    crConnectionInfo.DatabaseName = ConfigurationManager.AppSettings["DatabaseName"];
                    crConnectionInfo.UserID = ConfigurationManager.AppSettings["UserID"];
                    crConnectionInfo.Password = ConfigurationManager.AppSettings["Password"];

                    CrTables = rpt.Database.Tables;

                    foreach (CrystalDecisions.CrystalReports.Engine.Table CrTable in CrTables)
                    {
                        crtableLogoninfo = CrTable.LogOnInfo;
                        crtableLogoninfo.ConnectionInfo = crConnectionInfo;
                        CrTable.ApplyLogOnInfo(crtableLogoninfo);
                    }

                    CrystalReportViewer rptviewer1 = new CrystalReportViewer();
                    rptviewer1.AutoDataBind = true;
                    rptviewer1.SeparatePages = false;
                    rptviewer1.ToolPanelView = ToolPanelViewType.None;
                    rptviewer1.RefreshReport();
                    rptviewer1.Visible = true;
                    rptviewer1.HasExportButton = false;
                    rptviewer1.HasPrintButton = false;
                    rptviewer1.HasPageNavigationButtons = true;
                    rptviewer1.HasCrystalLogo = false;
                    rptviewer1.HasDrillUpButton = false;
                    rptviewer1.HasSearchButton = false;

                    rptviewer1.HasToggleGroupTreeButton = false;
                    rptviewer1.HasZoomFactorList = false;
                    rptviewer1.ToolbarStyle.Width = new Unit("750px");
                    rptviewer1.ReportSource = rpt;
                    string strDate = DateTime.Now.Year.ToString() + DateTime.Now.Month.ToString() + DateTime.Now.Day.ToString();
                    string strTime = DateTime.Now.Hour.ToString() + DateTime.Now.Minute.ToString() + DateTime.Now.Second.ToString();
                    filename = ProjectID + "_" + BillingPeriod + "_" + strDate + strTime;
                    //rpt.ExportToHttpResponse(ExportFormatType.PortableDocFormat, Response, true, filename);
                    if (InvoiceNumber == "")
                    {
                        InvoiceNumber = filename;
                    }
                    else
                    {
                        filename = InvoiceNumber;
                    }
                    filename = filename.Replace(",", "_");
                    if (!Directory.Exists(HttpContext.Current.Server.MapPath(@"~/BillingDocuments/")))
                    {
                        Directory.CreateDirectory(HttpContext.Current.Server.MapPath(@"~/BillingDocuments/"));
                    }
                    string filePath =
                        HttpContext.Current.Server.MapPath("~/BillingDocuments/") + filename + ".pdf";
                    int result = 0;
                    if (ProcessName == BillingPeriod)
                        result = new bllTracking().InsertGroupAttachmentPath_PDf(ProcessName, BillingPeriod, Convert.ToString(@"~/BillingDocuments/" + filename + ".pdf"));
                    else
                        result = new bllTracking().InsertGroupAttachmentPath_PDf(GroupName + "-" + ProcessName, BillingPeriod, Convert.ToString(@"~/BillingDocuments/" + filename + ".pdf"));
                    rpt.ExportToDisk(ExportFormatType.PortableDocFormat, filePath);
                    ReportFilePath = filePath;
                    ReportFileName = filename + ".pdf";

                    rpt.ExportToHttpResponse(ExportFormatType.PortableDocFormat, HttpContext.Current.Response, true, filename);
                }
                catch (Exception ex) { throw ex; }
            }
            return returnvalue;
        }

        protected void btn1_Click(object sender, EventArgs e)
        {
            //FileName = Server.MapPath(@"~\ReportDocument\Credit_Consolidated_Report_" + Convert.ToString(Month) + "-" + Convert.ToString(Year) + DateTime.Now.ToString("hhmmss") + ".xlsx");
            // FormatExcel(FileName);
            //Excel.Application xlApp = new Microsoft.Office.Interop.Excel.Application();
            //if (xlApp == null)
            //{
            //    return;
            //}
            //xlApp.DisplayAlerts = false;
            //Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(FileName);
            //System.Threading.Thread.Sleep(1000);
            //Excel.Sheets worksheets = xlWorkBook.Worksheets;
            //worksheets[1].Delete();
            //worksheets[1].Delete();
            //worksheets[1].Delete();
            //worksheets[2].Delete();
            //worksheets[1].Select();
            //xlWorkBook.Save();
            //xlWorkBook.Close();
            //xlApp.Quit();

            //releaseObject(worksheets);
            //releaseObject(xlWorkBook);
            //releaseObject(xlApp);

            string filePath = FileName;
            string outputPath = FileName;

            // Zero-based index: e.g., index 0 = first sheet
            int sheetIndexToDelete = 1;

            using (var workbook = new XLWorkbook(filePath))
            {
                // Check if index is within bounds
                if (sheetIndexToDelete >= 0 && sheetIndexToDelete < workbook.Worksheets.Count)
                {
                    var worksheet = workbook.Worksheet(1);
                    workbook.Worksheets.Delete(worksheet.Name);
                    worksheet = workbook.Worksheet(1);
                    workbook.Worksheets.Delete(worksheet.Name);
                    worksheet = workbook.Worksheet(1);
                    workbook.Worksheets.Delete(worksheet.Name);
                    worksheet = workbook.Worksheet(2);
                    workbook.Worksheets.Delete(worksheet.Name);

                    //worksheet = workbook.Worksheet(sheetIndexToDelete + 1);
                    //workbook.Worksheets.Delete(worksheet.Name);
                    //worksheet = workbook.Worksheet(sheetIndexToDelete + 2);
                    //workbook.Worksheets.Delete(worksheet.Name);
                    //worksheet = workbook.Worksheet(sheetIndexToDelete + 1);
                    //workbook.Worksheets.Delete(worksheet.Name);
                }
                else
                {

                }

                // Save the updated workbook
                workbook.SaveAs(outputPath);
            }
            Response.Clear();
            Response.Buffer = false;
            Response.AppendHeader("Content-Type", "application/xlsx");
            Response.AppendHeader("Content-Transfer-Encoding", "binary");
            Response.AppendHeader("Content-Disposition", "attachment; filename=" + Path.GetFileName(FileName));
            Response.TransmitFile(FileName);
            Response.End();
        }

        [WebMethod]
        public static int GenerateExcel(int ProjectID, string BillingPeriod, string Slot, int InvoiceId)
        {
            int returnvalue = 0;
            FileName = HttpContext.Current.Server.MapPath(@"~\ReportDocument\Order_Excel_" + DateTime.Now.ToString("hhmmss") + ".xlsx");

            book.DefaultFontSize = 10;
            book.DefaultFontName = "Aptos Narrow";

            int rowcount = 0;
            int colcount = 0;
            book = new Workbook();
            #region Project Inflow
            sheet = book.Worksheets.Add("Order Details");
            string Process = "";
            DataTable dtConfig = new bllTracking().GetProjectClientConfiguration(ProjectID, InvoiceId);
            if (dtConfig != null)
            {
                string InvoiceConfig = dtConfig.Rows[0]["InvoiceConfiguration"].ToString();
                Process = dtConfig.Rows[0]["ClientProcess"].ToString();
            }
            if (Process == BillingPeriod)
                Process = "";
            //else
            //    Process = ProcessName;
            //DataTable dt = new bllTracking().GetDataForInvoiceExcel(ProjectID, BillingPeriod, ProcessName, Slot);
            DataSet ds = new bllTracking().GetDataForInvoiceExcel_DS(ProjectID, BillingPeriod, Process, Slot);
            if (ds != null)
            {
                DataTable dt = ds.Tables[0];
                if (dt != null)
                {
                    if (dt.Columns.Contains("ProjectID1"))
                        dt.Columns.Remove("ProjectID1");
                    if (dt.Columns.Contains("SummaryReport"))
                        dt.Columns.Remove("SummaryReport");
                    if (dt.Columns.Contains("TredingReport"))
                        dt.Columns.Remove("TredingReport");
                    if (dt.Columns.Contains("TrackingSheetID"))
                        dt.Columns.Remove("TrackingSheetID");
                    if (dt.Columns.Contains("Criteria"))
                        dt.Columns.Remove("Criteria");
                    int ColCount = dt.Columns.Count;
                    if (dt.Columns.Contains("TotalCharges"))
                        dt.Columns["TotalCharges"].SetOrdinal(ColCount - 1);
                    if (dt.Columns.Contains("Price"))
                        dt.Columns["Price"].Caption = "Rate in USD";
                    if (dt.Columns.Contains("TotalCharges"))
                        dt.Columns["TotalCharges"].Caption = "Total Charges in US $";

                    sheet.InsertDataTable(dt, true, 1, 1);
                    string Col = GetColumnName_Static(dt.Columns.Count - 1);
                    CellRange range = sheet.Range["A1:" + Col + "1"];
                    HeaderFormat_Static(range);
                    range = sheet.Range["A1:" + Col + (dt.Rows.Count + 1)];
                    AllBorder_Static(range);
                    ContentCenter_Static(range);
                    rowcount = sheet.LastRow;
                    colcount = sheet.LastColumn;

                    if (ds.Tables[1].Rows.Count > 0)
                    {
                        string ColNameMerge = "";
                        decimal TotalCost = 0;
                        TotalCost = Convert.ToDecimal(ds.Tables[1].Rows[0][0]);
                        if (ds.Tables[0].Columns.Contains("SummaryReport"))
                        {
                            if (Convert.ToString(ds.Tables[0].Rows[0]["SummaryReport"]) != "" && Convert.ToString(ds.Tables[0].Rows[0]["SummaryReport"]) != "0" && Convert.ToString(ds.Tables[0].Rows[0]["SummaryReport"]) != "0.00")
                            {
                                ColNameMerge = GetColumnName_Static(ColCount - 2);
                                sheet.Range["A" + (rowcount + 1) + ":" + ColNameMerge + (rowcount + 1)].Merge();
                                sheet.Range["A" + (rowcount + 1) + ":" + ColNameMerge + (rowcount + 1)].Value = "Summary Report Charges";
                                ColNameMerge = GetColumnName_Static(ColCount - 1);
                                sheet.Range[ColNameMerge + (rowcount + 1)].Value = "" + Convert.ToString(ds.Tables[0].Rows[0]["SummaryReport"]);
                            }
                        }
                        if (ds.Tables[0].Columns.Contains("TredingReport"))
                        {
                            if (Convert.ToString(ds.Tables[0].Rows[0]["TredingReport"]) != "" && Convert.ToString(ds.Tables[0].Rows[0]["TredingReport"]) != "0" && Convert.ToString(ds.Tables[0].Rows[0]["TredingReport"]) != "0.00")
                            {
                                ColNameMerge = GetColumnName_Static(ColCount - 2);
                                sheet.Range["A" + (rowcount + 1) + ":" + ColNameMerge + (rowcount + 1)].Merge();
                                sheet.Range["A" + (rowcount + 1) + ":" + ColNameMerge + (rowcount + 1)].Value = "Treding Report Charges";
                                ColNameMerge = GetColumnName_Static(ColCount - 1);
                                sheet.Range[ColNameMerge + (rowcount + 1)].Value = "" + Convert.ToString(ds.Tables[0].Rows[0]["TredingReport"]);
                            }
                        }
                        rowcount = sheet.LastRow;
                        colcount = sheet.LastColumn;
                        ColNameMerge = GetColumnName_Static(ColCount - 2);
                        sheet.Range["A" + (rowcount + 1) + ":" + ColNameMerge + (rowcount + 1)].Merge();
                        sheet.Range["A" + (rowcount + 1) + ":" + ColNameMerge + (rowcount + 1)].Value = "NET USD";
                        ColNameMerge = GetColumnName_Static(ColCount - 1);
                        sheet.Range[ColNameMerge + (rowcount + 1)].Value = "" + Convert.ToString(TotalCost);

                        rowcount = sheet.LastRow;
                        colcount = sheet.LastColumn;
                        ColNameMerge = GetColumnName_Static(ColCount - 2);
                        sheet.Range["A" + (rowcount + 1) + ":" + ColNameMerge + (rowcount + 1)].Merge();
                        sheet.Range["A" + (rowcount + 1) + ":" + ColNameMerge + (rowcount + 1)].Value = "USD " + Number_ToText.Convert(TotalCost).ToString();
                        ColNameMerge = GetColumnName_Static(ColCount - 1);
                        AllBorder_Static(sheet.Range["A1:" + ColNameMerge + (rowcount + 1)]);
                    }

                    sheet.AllocatedRange.Style.Font.FontName = "Aptos Narrow";
                    sheet.AllocatedRange.Style.Font.Size = 10;

                    sheet.AllocatedRange.AutoFitColumns();
                    sheet.AllocatedRange.AutoFitRows();
                }
            }

            if (File.Exists(FileName))
            {
                try
                {
                    File.Delete(FileName);
                }
                catch { }
            }

            book.SaveToFile(FileName, ExcelVersion.Version2010);
            #endregion
            return returnvalue;
        }

        static void releaseObject(object obj)
        {
            try
            {
                System.Runtime.InteropServices.Marshal.ReleaseComObject(obj);
                obj = null;
            }
            catch
            {
            }
            finally
            {
                GC.Collect();
            }
        }

        static string GetColumnName_Static(int index)
        {
            const string letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

            var value = "";

            if (index >= letters.Length)
                value += letters[index / letters.Length - 1];

            value += letters[index % letters.Length];

            return value;
        }

        public static void HeaderFormat_Static(CellRange range)
        {
            range.Style.Borders.LineStyle = LineStyleType.Thin;
            range.Style.Borders[BordersLineType.DiagonalUp].LineStyle = LineStyleType.None;
            range.Style.Borders[BordersLineType.DiagonalDown].LineStyle = LineStyleType.None;
            range.Style.Color = Color.FromArgb(113, 147, 209);
            range.Style.Font.Color = Color.White;
            range.Style.HorizontalAlignment = HorizontalAlignType.Center;
            range.Style.Font.IsBold = true;
        }

        public static void AllBorder_Static(CellRange range)
        {
            range.Style.Borders.LineStyle = LineStyleType.Thin;
            range.Style.Borders[BordersLineType.DiagonalUp].LineStyle = LineStyleType.None;
            range.Style.Borders[BordersLineType.DiagonalDown].LineStyle = LineStyleType.None;
        }
        public static void ContentCenter_Static(CellRange range)
        {
            range.Style.HorizontalAlignment = HorizontalAlignType.Center;
        }

        public static void DashboardHeader_Static(CellRange range)
        {
            range.Style.HorizontalAlignment = HorizontalAlignType.Center;
            range.Style.Font.Size = 12;
            range.Style.Font.IsBold = true;
            range.Style.Borders.LineStyle = LineStyleType.Thin;
            range.Style.Borders[BordersLineType.DiagonalUp].LineStyle = LineStyleType.None;
            range.Style.Borders[BordersLineType.DiagonalDown].LineStyle = LineStyleType.None;
        }

        public static void DashboardContent_Static(CellRange range)
        {
            range.Style.HorizontalAlignment = HorizontalAlignType.Center;
            range.Style.Font.Size = 10;
            range.Style.Borders.LineStyle = LineStyleType.Thin;
            range.Style.Borders[BordersLineType.DiagonalUp].LineStyle = LineStyleType.None;
            range.Style.Borders[BordersLineType.DiagonalDown].LineStyle = LineStyleType.None;
        }

        protected void btndownloadsenttoclient_Click(object sender, EventArgs e)
        {
            Response.Clear();
            Response.Buffer = false;
            Response.AppendHeader("Content-Type", "application/xlsx");
            Response.AppendHeader("Content-Transfer-Encoding", "binary");
            Response.AppendHeader("Content-Disposition", "attachment; filename=" + Path.GetFileName(ReportFilePath));
            Response.TransmitFile(ReportFilePath);
            Response.End();
        }
    }
}