using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using CrystalDecisions.Web;
using Spire.Xls;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using Vendor_Portal.App_Code.BLL;

namespace Vendor_Portal.BDM
{
    public partial class SentToAccounts_Revised : System.Web.UI.Page
    {
        public static string ProjectID;
        public static string BillingPeriod;
        public static string ProjectName;
        public static int DomainId;
        public static string InvoiceNumber = "";
        static string FileName;
        static Workbook book = new Workbook();
        static Worksheet sheet;
        public static string ReportFileName = "";
        public static string ReportFilePath = "";
        protected void Page_Load(object sender, EventArgs e)
        {
            ProjectID = Convert.ToString(Request.QueryString["ProjectID"]);
            BillingPeriod = Convert.ToString(Request.QueryString["BillingPeriod"]);
            ProjectName = Convert.ToString(Request.QueryString["ProjectName"]);
            DomainId = Convert.ToInt32(Request.QueryString["DomainId"]);
        }

        public class OtherBillingAmountRow
        {
            public long Id { get; set; }
            public string BillingType { get; set; }
            public decimal Amount { get; set; }
            public string InvoiceDisplayName { get; set; }
        }

        public class OtherBillingAmountData
        {
            public List<string> BillingTypes { get; set; }
            public List<OtherBillingAmountRow> Records { get; set; }
        }

        private static string GetOtherBillingPeriod(string billingPeriod)
        {
            if (String.IsNullOrWhiteSpace(billingPeriod))
                throw new ArgumentException("Billing period is required.");

            DateTime periodDate;
            string firstDate = billingPeriod.Split('~')[0].Trim();
            string[] periodParts = billingPeriod.Split('~');
            if (periodParts.Length == 2 && periodParts[0].Trim().All(Char.IsLetter))
                firstDate = "1 " + periodParts[0].Trim() + " " + periodParts[1].Trim();
            if (!DateTime.TryParse(firstDate, CultureInfo.InvariantCulture, DateTimeStyles.AllowWhiteSpaces, out periodDate))
                throw new ArgumentException("Invalid billing period.");
            return periodDate.ToString("MMMM~yyyy", CultureInfo.InvariantCulture);
        }

        private static void EnsureOtherBillingProject(int projectId)
        {
            if (projectId != 70)
                throw new InvalidOperationException("Other Billing Amounts are available only for Project 561.");
        }

        [WebMethod]
        public static OtherBillingAmountData GetOtherBillingAmounts(int projectId, string billingPeriod)
        {
            EnsureOtherBillingProject(projectId);
            string normalizedPeriod = GetOtherBillingPeriod(billingPeriod);
            string[] periodParts = normalizedPeriod.Split('~');
            DataTable configuredRows = new bllTracking().GetOtherAmount(periodParts[0], periodParts[1]);
            OtherBillingAmountData result = new OtherBillingAmountData
            {
                BillingTypes = new List<string>(),
                Records = new List<OtherBillingAmountRow>()
            };

            if (configuredRows != null)
            {
                foreach (DataRow row in configuredRows.Rows)
                {
                    string billingType = Convert.ToString(row["ChargeType"]).Trim();
                    if (billingType.Length > 0 && !result.BillingTypes.Contains(billingType, StringComparer.OrdinalIgnoreCase))
                        result.BillingTypes.Add(billingType);
                }
            }

            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["InfinityBilling"].ConnectionString))
            using (SqlCommand command = new SqlCommand(@"
                SELECT DISTINCT LTRIM(RTRIM(ChargeType)) AS ChargeType
                FROM InfinityBilling_OtherBillingAmount
                WHERE NULLIF(LTRIM(RTRIM(ChargeType)), '') IS NOT NULL;

                SELECT Id, ChargeType, Amount, DisplayName
                FROM InfinityBilling_OtherBillingAmount
                WHERE BillingPeriod = @BillingPeriod
                  AND (ProjectId = @ProjectId OR ProjectId IS NULL)
                  AND NULLIF(LTRIM(RTRIM(ChargeType)), '') IS NOT NULL
                ORDER BY Id", connection))
            {
                command.Parameters.Add("@BillingPeriod", SqlDbType.NVarChar, 100).Value = normalizedPeriod;
                command.Parameters.Add("@ProjectId", SqlDbType.NVarChar, 20).Value = projectId.ToString(CultureInfo.InvariantCulture);
                connection.Open();
                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        string configuredType = Convert.ToString(reader["ChargeType"]).Trim();
                        if (!result.BillingTypes.Contains(configuredType, StringComparer.OrdinalIgnoreCase))
                            result.BillingTypes.Add(configuredType);
                    }
                    reader.NextResult();
                    while (reader.Read())
                    {
                        decimal amount;
                        Decimal.TryParse(Convert.ToString(reader["Amount"]), NumberStyles.Number, CultureInfo.InvariantCulture, out amount);
                        string billingType = Convert.ToString(reader["ChargeType"]).Trim();
                        if (!result.BillingTypes.Contains(billingType, StringComparer.OrdinalIgnoreCase))
                            result.BillingTypes.Add(billingType);
                        result.Records.Add(new OtherBillingAmountRow
                        {
                            Id = Convert.ToInt64(reader["Id"]),
                            BillingType = billingType,
                            Amount = amount,
                            InvoiceDisplayName = Convert.ToString(reader["DisplayName"])
                        });
                    }
                }
            }

            result.BillingTypes.Sort(StringComparer.OrdinalIgnoreCase);
            return result;
        }

        [WebMethod]
        public static bool CheckOtherBillingAmountExists(int projectId, string billingPeriod)
        {
            EnsureOtherBillingProject(projectId);
            string normalizedPeriod = GetOtherBillingPeriod(billingPeriod);
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["InfinityBilling"].ConnectionString))
            using (SqlCommand command = new SqlCommand(@"
                SELECT CASE WHEN EXISTS (
                    SELECT 1 FROM InfinityBilling_OtherBillingAmount
                    WHERE BillingPeriod = @BillingPeriod
                      AND (ProjectId = @ProjectId OR ProjectId IS NULL)
                      AND NULLIF(LTRIM(RTRIM(ChargeType)), '') IS NOT NULL
                ) THEN 1 ELSE 0 END", connection))
            {
                command.Parameters.Add("@BillingPeriod", SqlDbType.NVarChar, 100).Value = normalizedPeriod;
                command.Parameters.Add("@ProjectId", SqlDbType.NVarChar, 20).Value = projectId.ToString(CultureInfo.InvariantCulture);
                connection.Open();
                return Convert.ToInt32(command.ExecuteScalar()) == 1;
            }
        }

        [WebMethod]
        public static int SaveOtherBillingAmounts(int projectId, string billingPeriod, List<OtherBillingAmountRow> rows)
        {
            EnsureOtherBillingProject(projectId);
            string normalizedPeriod = GetOtherBillingPeriod(billingPeriod);
            rows = rows ?? new List<OtherBillingAmountRow>();
            HashSet<string> billingTypes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (OtherBillingAmountRow row in rows)
            {
                row.BillingType = (row.BillingType ?? String.Empty).Trim();
                row.InvoiceDisplayName = (row.InvoiceDisplayName ?? String.Empty).Trim();
                if (row.BillingType.Length == 0 || row.InvoiceDisplayName.Length == 0 || row.Amount <= 0)
                    throw new ArgumentException("Billing Type, an Amount greater than zero, and Invoice Display Name are required.");
                if (!billingTypes.Add(row.BillingType))
                    throw new ArgumentException("Each Billing Type can be entered only once for a billing month.");
            }

            long addedBy = Convert.ToInt64(HttpContext.Current.User.Identity.Name, CultureInfo.InvariantCulture);
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["InfinityBilling"].ConnectionString))
            {
                connection.Open();
                using (SqlTransaction transaction = connection.BeginTransaction())
                {
                    try
                    {
                        List<long> existingIds = new List<long>();
                        using (SqlCommand select = new SqlCommand(@"
                            SELECT Id FROM InfinityBilling_OtherBillingAmount
                            WHERE BillingPeriod = @BillingPeriod
                              AND (ProjectId = @ProjectId OR ProjectId IS NULL)
                              AND NULLIF(LTRIM(RTRIM(ChargeType)), '') IS NOT NULL", connection, transaction))
                        {
                            select.Parameters.Add("@BillingPeriod", SqlDbType.NVarChar, 100).Value = normalizedPeriod;
                            select.Parameters.Add("@ProjectId", SqlDbType.NVarChar, 20).Value = projectId.ToString(CultureInfo.InvariantCulture);
                            using (SqlDataReader reader = select.ExecuteReader())
                                while (reader.Read()) existingIds.Add(Convert.ToInt64(reader["Id"]));
                        }

                        HashSet<long> submittedIds = new HashSet<long>(rows.Where(row => row.Id > 0).Select(row => row.Id));
                        foreach (long existingId in existingIds.Where(id => !submittedIds.Contains(id)))
                        {
                            using (SqlCommand delete = new SqlCommand("DELETE FROM InfinityBilling_OtherBillingAmount WHERE Id = @Id", connection, transaction))
                            {
                                delete.Parameters.Add("@Id", SqlDbType.BigInt).Value = existingId;
                                delete.ExecuteNonQuery();
                            }
                        }

                        foreach (OtherBillingAmountRow row in rows)
                        {
                            int updated = 0;
                            if (row.Id > 0)
                            {
                                using (SqlCommand update = new SqlCommand(@"
                                    UPDATE InfinityBilling_OtherBillingAmount
                                    SET ProjectId = @ProjectId, ChargeType = @ChargeType, Amount = @Amount,
                                        DisplayName = @DisplayName, AddedBy = @AddedBy, AddedDate = GETDATE()
                                    WHERE Id = @Id AND BillingPeriod = @BillingPeriod
                                      AND (ProjectId = @ProjectId OR ProjectId IS NULL)", connection, transaction))
                                {
                                    update.Parameters.Add("@Id", SqlDbType.BigInt).Value = row.Id;
                                    update.Parameters.Add("@ProjectId", SqlDbType.NVarChar, 20).Value = projectId.ToString(CultureInfo.InvariantCulture);
                                    update.Parameters.Add("@BillingPeriod", SqlDbType.NVarChar, 100).Value = normalizedPeriod;
                                    update.Parameters.Add("@ChargeType", SqlDbType.NVarChar, 200).Value = row.BillingType;
                                    update.Parameters.Add("@Amount", SqlDbType.NVarChar, 100).Value = row.Amount.ToString("0.00", CultureInfo.InvariantCulture);
                                    update.Parameters.Add("@DisplayName", SqlDbType.NVarChar, -1).Value = row.InvoiceDisplayName;
                                    update.Parameters.Add("@AddedBy", SqlDbType.BigInt).Value = addedBy;
                                    updated = update.ExecuteNonQuery();
                                }
                            }

                            if (updated > 0) continue;
                            using (SqlCommand insert = new SqlCommand(@"
                                INSERT INTO InfinityBilling_OtherBillingAmount
                                    (ProjectId, BillingPeriod, ChargeType, Amount, DisplayName, AddedBy, AddedDate)
                                VALUES
                                    (@ProjectId, @BillingPeriod, @ChargeType, @Amount, @DisplayName, @AddedBy, GETDATE())", connection, transaction))
                            {
                                insert.Parameters.Add("@ProjectId", SqlDbType.NVarChar, 20).Value = projectId.ToString(CultureInfo.InvariantCulture);
                                insert.Parameters.Add("@BillingPeriod", SqlDbType.NVarChar, 100).Value = normalizedPeriod;
                                insert.Parameters.Add("@ChargeType", SqlDbType.NVarChar, 200).Value = row.BillingType;
                                insert.Parameters.Add("@Amount", SqlDbType.NVarChar, 100).Value = row.Amount.ToString("0.00", CultureInfo.InvariantCulture);
                                insert.Parameters.Add("@DisplayName", SqlDbType.NVarChar, -1).Value = row.InvoiceDisplayName;
                                insert.Parameters.Add("@AddedBy", SqlDbType.BigInt).Value = addedBy;
                                insert.ExecuteNonQuery();
                            }
                        }

                        transaction.Commit();
                        return rows.Count;
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }
        [WebMethod]
        public static string GetTotalProjectAmount(int ProjectID, string ProjectName, string BillingPeriod, string Slot)
        {
            string ProcessName = "";
            if (ProjectName.Contains("-"))
            {
                ProcessName = ProjectName.Substring(ProjectName.IndexOf("-") + 1);
            }
            DataSet ds = new bllTracking().GetTotalProjectAmount_UW(ProjectID, BillingPeriod, ProcessName, Slot);
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            Dictionary<string, object> row;
            if (ds != null)
            {
                DataTable dt1 = ds.Tables[0];
                if (dt1 != null)
                {
                    try
                    {
                        dt1.Columns.Remove("TrackingSheetID");
                        if (dt1.Columns.Contains("Loan #2"))
                            dt1.Columns.Remove("Loan #2");
                        if (dt1.Columns.Contains("Review"))
                            dt1.Columns.Remove("Review");
                        if (dt1.Columns.Contains("Review Status"))
                            dt1.Columns.Remove("Review Status");
                        if (dt1.Columns.Contains("QC"))
                            dt1.Columns.Remove("QC");
                        if (dt1.Columns.Contains("Loan #3"))
                            dt1.Columns.Remove("Loan #3");
                        if (dt1.Columns.Contains("Loan #4"))
                            dt1.Columns.Remove("Loan #4");
                        if (dt1.Columns.Contains("Borrower Name"))
                            dt1.Columns.Remove("Borrower Name");
                        if (dt1.Columns.Contains("State"))
                            dt1.Columns.Remove("State");
                        if (dt1.Columns.Contains("State"))
                            dt1.Columns.Remove("State");
                        dt1.AcceptChanges();
                        dt1.Columns["TotalCharges"].SetOrdinal(dt1.Columns.Count - 1);
                        dt1.AcceptChanges();
                    }
                    catch { }
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
            }
            JavaScriptSerializer ser = new JavaScriptSerializer();
            ser.MaxJsonLength = int.MaxValue;
            return ser.Serialize(rows);
        }
        [WebMethod]
        public static string GetMergedBillingSummary_Revised(string BillingPeriod, int ProjectId)
        {
            DataTable dt1 = new bllTracking().GetMergedBillingFor561_Revised(BillingPeriod, ProjectId);
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            Dictionary<string, object> row;
            if (dt1 != null)
            {
                if (dt1.Columns.Contains("InvoiceNumber"))
                    dt1.Columns.Remove("InvoiceNumber");
                if (dt1.Columns.Contains("ClientName"))
                    dt1.Columns.Remove("ClientName");
                if (dt1.Columns.Contains("Address"))
                    dt1.Columns.Remove("Address");
                if (dt1.Columns.Contains("InvoiceDate"))
                    dt1.Columns.Remove("InvoiceDate");
                if (dt1.Columns.Contains("DueDate"))
                    dt1.Columns.Remove("DueDate");
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
        public static int VerifyOrders(int ProjectID, string ProjectName, string BillingPeriod, string Slot)
        {
            int returnvalue = 0;
            string ProcessName = "";
            if (ProjectName.Contains("-"))
            {
                ProcessName = ProjectName.Substring(ProjectName.IndexOf("-") + 1);
            }
            returnvalue = new bllTracking().VerifyBDMOrders(ProjectID, BillingPeriod, ProcessName, Slot);
            return returnvalue;
        }

        [WebMethod]
        public static int GetBillingPeriodVerifiedStatus(int ProjectID, string BillingPeriod, string Slot)
        {
            int returnvalue = 0;
            returnvalue = new bllTracking().GetBillingPeriodVerifiedStatus(ProjectID, BillingPeriod, Slot);
            return returnvalue;
        }

        [WebMethod]
        public static int GetActualLoanCount(int ProjectID, string BillingPeriod)
        {
            const string procedureName = "usp_GetActualLoanBilledCount";
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["InfinityBilling"].ConnectionString))
            using (SqlCommand command = new SqlCommand(procedureName, connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.Add("@ProjectID", SqlDbType.Int).Value = ProjectID;
                command.Parameters.Add("@BillingPeriod", SqlDbType.NVarChar, 1000).Value = BillingPeriod;
                connection.Open();
                object result = command.ExecuteScalar();
                return result == null || result == DBNull.Value ? 0 : Convert.ToInt32(result);
            }
        }

        [WebMethod]
        public static string GetInvoiceNumber(int ProjectID, string ProjectName, string BillingPeriod)
        {
            string ProcessName = "";
            if (ProjectName.Contains("-"))
            {
                ProcessName = ProjectName.Substring(ProjectName.IndexOf("-") + 1);
            }
            DataTable dt1 = new bllTracking().GetInvoicePreview(ProjectID, ProcessName, BillingPeriod, "");
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
        public static string GenerateInvoice(string Amount)
        {
            int returnvalue = 1;
            CrystalReportViewer crReport = new CrystalReportViewer();
            crReport.AutoDataBind = true;
            string Process = "";
            string Securitization = "";
            if (ProjectName.Contains("-"))
            {
                Process = Convert.ToString(ProjectName.Substring(ProjectName.IndexOf("-") + 1));
            }
            else
            {
                Process = BillingPeriod;
            }

            DataTable dtPreview = new bllTracking().GetInvoicePreview(int.Parse(ProjectID), Process, BillingPeriod, Amount);
            if (dtPreview != null)
            {
                if (dtPreview.Rows.Count > 0)
                {
                    Securitization = Convert.ToString(dtPreview.Rows[0]["Securitization"]);
                    InvoiceNumber = Convert.ToString(dtPreview.Rows[0]["InvoiceNumber"]);
                }
            }

            DataSet dt = new DataSet();

            ReportDocument rpt = new ReportDocument();
            //if (Process != BillingPeriod)
            //    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/PCQCSummary_Preview.rpt"));
            //else if (Securitization == "561")
            //    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/SecuritizationPreview561.rpt"));
            //else if (Securitization == "Yes")
            //    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/SecuritizationPreview.rpt"));
            //else if (Securitization == "Rebuttal")
            //    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/RebuttalPreview.rpt"));
            //else if (Securitization == "Research")
            //    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/Research_Preview.rpt"));
            //else if (Securitization == "Inventory")
            //    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/Inventory_Preview.rpt"));
            //else if (Securitization == "642")
            //    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/642_Preview.rpt"));
            //else if (Securitization == "670")
            //    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/670_Preview.rpt"));
            //else if (int.Parse(ProjectID) == 70)
            //    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/NewSummaryReport1561_Preview.rpt"));
            //else if (int.Parse(ProjectID) == 512)
            //    rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/2091_Preview.rpt"));
            //else
            if (Process != BillingPeriod)
                rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/PCQCSummary_Preview.rpt"));
            else if (Securitization == "561")
                rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/SecuritizationPreview561.rpt"));
            else if (Securitization == "Yes")
                rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/SecuritizationPreview.rpt"));
            else if (Securitization == "Rebuttal")
                rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/RebuttalPreview.rpt"));
            else if (Securitization == "Research")
                rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/Research_Preview.rpt"));
            else if (Securitization == "Inventory")
                rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/Inventory_Preview.rpt"));
            else if (Securitization == "642")
                rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/642_Preview.rpt"));
            else if (Securitization == "670")
                rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/670_Preview.rpt"));
            else if (int.Parse(ProjectID) != 70)
                rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/MergeBillingAll.rpt"));
            else
                rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/561Preview.rpt"));
            //rpt.Load(HttpContext.Current.Server.MapPath("~/Reports/NewFormMerge.rpt"));


            CrystalDecisions.Shared.ParameterValues pval1 = new ParameterValues();
            CrystalDecisions.Shared.ParameterValues pval2 = new ParameterValues();
            CrystalDecisions.Shared.ParameterValues pval3 = new ParameterValues();
            CrystalDecisions.Shared.ParameterValues pval4 = new ParameterValues();
            CrystalDecisions.Shared.ParameterValues pval5 = new ParameterValues();
            CrystalDecisions.Shared.ParameterValues pval6 = new ParameterValues();
            CrystalDecisions.Shared.ParameterValues pval7 = new ParameterValues();

            ParameterDiscreteValue pdisval2 = new ParameterDiscreteValue();
            pdisval2.Value = ProjectID;
            pval2.Add(pdisval2);

            ParameterDiscreteValue pdisval3 = new ParameterDiscreteValue();
            pdisval3.Value = BillingPeriod;
            pval3.Add(pdisval3);

            ParameterDiscreteValue pdisval4 = new ParameterDiscreteValue();
            if (BillingPeriod != Process)
                pdisval4.Value = Process;
            else
                pdisval4.Value = "";
            pval4.Add(pdisval4);

            ParameterDiscreteValue pdisval5 = new ParameterDiscreteValue();
            pdisval5.Value = Convert.ToString(HttpContext.Current.Request.Form["billdetails_header_totalamount"]);
            pval5.Add(pdisval5);

            ParameterDiscreteValue pdisval6 = new ParameterDiscreteValue();
            pdisval6.Value = Convert.ToString(Convert.ToString(HttpContext.Current.Request.QueryString["Slot"]));
            pval7.Add(pdisval6);

            rpt.DataDefinition.ParameterFields["@ProjectID"].ApplyCurrentValues(pval2);
            if (int.Parse(ProjectID) != 70)
            {
                rpt.DataDefinition.ParameterFields["@ProcessName"].ApplyCurrentValues(pval4);
                rpt.DataDefinition.ParameterFields["@TotalCost"].ApplyCurrentValues(pval5);
            }
            rpt.DataDefinition.ParameterFields["@BillingPeriod"].ApplyCurrentValues(pval3);
            int chkSlot = new bllTracking().CheckSlotPassing(int.Parse(ProjectID), BillingPeriod, Process);
            //if (chkSlot == 1)
            //    rpt.DataDefinition.ParameterFields["@Slot"].ApplyCurrentValues(pval7);

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


            crReport.RefreshReport();
            crReport.Visible = true;
            crReport.HasExportButton = false;
            crReport.HasPrintButton = false;
            crReport.HasPageNavigationButtons = true;
            crReport.HasCrystalLogo = false;
            crReport.HasDrillUpButton = false;
            crReport.HasSearchButton = false;

            crReport.HasToggleGroupTreeButton = false;
            crReport.HasZoomFactorList = false;
            crReport.ToolbarStyle.Width = new Unit("750px");
            crReport.ReportSource = rpt;
            string strDate = DateTime.Now.Year.ToString() + DateTime.Now.Month.ToString() + DateTime.Now.Day.ToString();
            string strTime = DateTime.Now.Hour.ToString() + DateTime.Now.Minute.ToString() + DateTime.Now.Second.ToString();
            string filename = ProjectID + "_" + BillingPeriod + "_" + strDate + strTime;
            try
            {
                InvoiceNumber = Convert.ToString(dtPreview.Rows[0]["InvoiceNumber"]);
            }
            catch { }
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

            int result = new bllTracking().InsertGroupAttachmentPath_PDf_Before(ProjectName + "-" + Process, BillingPeriod, Convert.ToString(@"~/BillingDocuments/" + filename + ".pdf"), InvoiceNumber);
            rpt.ExportToDisk(ExportFormatType.PortableDocFormat, filePath);
            ReportFilePath = filePath;
            ReportFileName = filename + ".pdf";

            return "ReportPreview.aspx?kind=pdf&file=" + HttpUtility.UrlEncode(ReportFileName);

        }

        public void btndownload_Click(object sender, EventArgs e)
        {
            Response.Clear();
            Response.Buffer = false;
            Response.AppendHeader("Content-Type", "application/xlsx");
            Response.AppendHeader("Content-Transfer-Encoding", "binary");
            Response.AppendHeader("Content-Disposition", "attachment; filename=" + Path.GetFileName(ReportFilePath));
            Response.TransmitFile(ReportFilePath);
            Response.End();
        }

        protected void newbtn_Click(object sender, EventArgs e)
        {

        }

        [WebMethod]
        public static int Sendtoclient(int ProjectID, string ProjectName, string BillingPeriod, string Amount, int OrderCount, bool IsManual, string InvoiceNumber)
        {
            int returnvalue = 0;
            string ProcessName = "";
            if (ProjectName.Contains("-"))
            {
                ProcessName = ProjectName.Substring(ProjectName.IndexOf("-") + 1);
            }

            // Project Name 561 stores monthly Other Billing Amounts separately.
            // Add their current month total on the server so InvoiceMaster gets
            // the complete invoice amount and cannot depend on browser values.
            if (ProjectID == 70 && String.Equals((ProjectName ?? String.Empty).Trim(), "561", StringComparison.OrdinalIgnoreCase))
            {
                decimal invoiceAmount;
                if (!Decimal.TryParse(Amount, NumberStyles.Number, CultureInfo.InvariantCulture, out invoiceAmount) &&
                    !Decimal.TryParse(Amount, NumberStyles.Number, CultureInfo.CurrentCulture, out invoiceAmount))
                    throw new ArgumentException("Invalid invoice amount.");

                string normalizedPeriod = GetOtherBillingPeriod(BillingPeriod);
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["InfinityBilling"].ConnectionString))
                using (SqlCommand command = new SqlCommand(@"
                    SELECT ISNULL(SUM(ISNULL(TRY_CONVERT(DECIMAL(18,2), Amount), 0)), 0)
                    FROM InfinityBilling_OtherBillingAmount
                    WHERE BillingPeriod = @BillingPeriod
                      AND (ProjectId = @ProjectId OR ProjectId IS NULL)
                      AND NULLIF(LTRIM(RTRIM(ChargeType)), '') IS NOT NULL", connection))
                {
                    command.Parameters.Add("@BillingPeriod", SqlDbType.NVarChar, 100).Value = normalizedPeriod;
                    command.Parameters.Add("@ProjectId", SqlDbType.NVarChar, 20).Value = ProjectID.ToString(CultureInfo.InvariantCulture);
                    connection.Open();
                    invoiceAmount += Convert.ToDecimal(command.ExecuteScalar(), CultureInfo.InvariantCulture);
                }
                Amount = invoiceAmount.ToString("0.00", CultureInfo.InvariantCulture);
            }

            Hashtable htParam = new Hashtable();
            htParam.Add("ProjectID", Convert.ToString(ProjectID));
            htParam.Add("BillingPeriod", Convert.ToString(BillingPeriod));
            htParam.Add("ProjectName", Convert.ToString(ProjectName));
            htParam.Add("Amount", Amount);
            htParam.Add("Added_By", int.Parse(HttpContext.Current.User.Identity.Name.ToString()));
            htParam.Add("OrderCount", OrderCount);
            htParam.Add("IsManual", IsManual);
            htParam.Add("InvoiceNoManual", InvoiceNumber);
            returnvalue = new bllTracking().UpdateSendToclient_MonthlyBilling(htParam);
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

        [WebMethod]
        public static int GenerateLoanListExcel(string BillingPeriod)
        {
            int returnvalue = 0;
            FileName = HttpContext.Current.Server.MapPath(@"~\ReportDocument\Order_Excel_" + DateTime.Now.ToString("hhmmss") + ".xlsx");

            book.DefaultFontSize = 10;
            book.DefaultFontName = "Aptos Narrow";

            int rowcount = 0;
            int colcount = 0;

            #region Project Inflow
            sheet = book.Worksheets.Add("Order Details");

            DataTable dt = new bllTracking().GetLoanList(BillingPeriod);
            if (dt != null)
            {
                dt.Columns["BillingDealNo"].SetOrdinal(0);
                dt.Columns["BillingDealNo"].Caption = "Billing Period";
                dt.Columns["ProjectNo"].SetOrdinal(1);
                dt.Columns["ProjectNo"].Caption = "Project #";
                dt.Columns["TrackingDealNo"].SetOrdinal(2);
                dt.Columns["TrackingDealNo"].Caption = "Deal #";
                dt.Columns["LoanNo"].SetOrdinal(3);
                dt.Columns["LoanNo"].Caption = "Loan #1";
                dt.Columns["LoanNo2"].SetOrdinal(4);
                dt.Columns["LoanNo2"].Caption = "Loan #2";
                dt.Columns["ReceivedDate"].SetOrdinal(5);
                dt.Columns["ReceivedDate"].Caption = "Received Date";
                dt.Columns["DeliveredDate"].SetOrdinal(6);
                dt.Columns["DeliveredDate"].Caption = "Delivered Date";
                dt.Columns["Source"].SetOrdinal(7);
                dt.Columns["Source"].Caption = "Source";
                dt.AcceptChanges();

                sheet.InsertDataTable(dt, true, 1, 1);
                string Col = GetColumnName_Static(dt.Columns.Count - 1);
                CellRange range = sheet.Range["A1:" + Col + "1"];
                HeaderFormat_Static(range);
                range = sheet.Range["A1:" + Col + (dt.Rows.Count + 1)];
                AllBorder_Static(range);
                ContentCenter_Static(range);
                rowcount = sheet.LastRow;
                colcount = sheet.LastColumn;

                sheet.AllocatedRange.Style.Font.FontName = "Aptos Narrow";
                sheet.AllocatedRange.Style.Font.Size = 10;

                sheet.AllocatedRange.AutoFitColumns();
                sheet.AllocatedRange.AutoFitRows();
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

        protected void btn1_Click(object sender, EventArgs e)
        {
            //FileName = Server.MapPath(@"~\ReportDocument\Credit_Consolidated_Report_" + Convert.ToString(Month) + "-" + Convert.ToString(Year) + DateTime.Now.ToString("hhmmss") + ".xlsx");
            // FormatExcel(FileName);
            Microsoft.Office.Interop.Excel.Application xlApp = new Microsoft.Office.Interop.Excel.Application();
            if (xlApp == null)
            {
                return;
            }
            xlApp.DisplayAlerts = false;
            Microsoft.Office.Interop.Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(FileName);
            System.Threading.Thread.Sleep(1000);
            Microsoft.Office.Interop.Excel.Sheets worksheets = xlWorkBook.Worksheets;
            worksheets[1].Delete();
            worksheets[1].Delete();
            worksheets[1].Delete();
            worksheets[2].Delete();
            worksheets[1].Select();
            xlWorkBook.Save();
            xlWorkBook.Close();
            xlApp.Quit();

            releaseObject(worksheets);
            releaseObject(xlWorkBook);
            releaseObject(xlApp);

            Response.Clear();
            Response.Buffer = false;
            Response.AppendHeader("Content-Type", "application/xlsx");
            Response.AppendHeader("Content-Transfer-Encoding", "binary");
            Response.AppendHeader("Content-Disposition", "attachment; filename=" + Path.GetFileName(FileName));
            Response.TransmitFile(FileName);
            Response.End();
        }

        [WebMethod]
        public static int SendBackToProduction(int ProjectId, string ProjectName, string BillingPeriod, string Reason)
        {
            int returnvalue = 0;
            returnvalue = new bllTracking().InsertAllProjectSendToAccountsDetailsBackToProduction(ProjectId, BillingPeriod, int.Parse(HttpContext.Current.User.Identity.Name.ToString()));
            int newvalue = SendEmail(ProjectName, BillingPeriod, Reason);
            return returnvalue;
        }

        static string Header = "<html><head><meta content='text/html; charset=utf-8' http-equiv='Content-Type'><title></title><style type='text/css'>a:hover { text-decoration: none !important; }.header h1 {color: #fff !important; font: normal 33px Georgia, serif; margin: 0; padding: 0; line-height: 33px;}.header p {color: #dfa575; font: normal 11px Georgia, serif; margin: 0; padding: 0; line-height: 11px; letter-spacing: 2px}.content h2 {color:#8598a3 !important; font-weight: normal; margin: 0; padding: 0; font-style: italic; line-height: 30px; font-size: 30px;font-family: Georgia, serif; }.content p {color:#767676; font-weight: normal; margin: 0; padding: 0; line-height: 20px; font-size: 12px;font-family: Georgia, serif;}.content a {color: #d18648; text-decoration: none;}.footer p {padding: 0; font-size: 11px; color:#fff; margin: 0; font-family: Georgia, serif;}.footer a {color: #f7a766; text-decoration: none;}</style></head><body><table cellpadding='0' cellspacing='0' border='1'><tr><td ><table cellpadding='0' cellspacing='0' border='0' align='center' width='100%' style='font-family: Georgia, serif;' class='header'><tr><td bgcolor='#16a085' height='70' align='center'><h1 style='color: #fff; font: normal 25px Verdana; margin: 0; padding: 0; line-height: 33px;'>Infinity Invoice</h1></td></tr><tr><td style='font-size: 1px; height: 5px; line-height: 1px;' height='5'>&nbsp;</td></tr></table>";

        static string Footer = "<table cellpadding='0' cellspacing='0' border='0' align='center' width='100%' style='font-family: Georgia, serif; line-height: 10px; margin-top:30px;' bgcolor='#16a085' class='footer'><tr><td bgcolor='#16a085'  align='center' style='padding: 15px 0 10px; font-size: 11px; color:#fff; margin: 0; line-height: 1.2;font-family: Verdana;' valign='top'><p style='padding: 0; font-size: 11px; color:#fff; margin: 0; font-family: Georgia, serif;'>!!! This is software generated e-mail...Please do not reply. !!</p></td></tr> </table></td></tr></table></body></html>";


        [WebMethod]
        public static int SendEmail(string ProjectName, string BillingPeriod, string Reason)
        {
            int returnvalue = 0;
            string ToAddress = "";
            string ToCC = "";
            string ToBCC = "";

            StringBuilder htmlBody = new StringBuilder();
            htmlBody.Append("<table width=\"100%\"><tr><td align=\"left\"><b>Dear Sir/Madam,</b></td></tr><tr>");
            htmlBody.Append("<td align=\"left\">This is to inform you that billing data for project <b>" + ProjectName + "</b> and Billing Period <b>" + BillingPeriod + " </b>has been send back to production with below remark from Billing Team.<br /><br /> <span style='color:brown; font-size:14px;'>" + Reason + "</span> </td></tr></table><br />");
            htmlBody.Append("</br><hr /><table width=\"100%x\"><p><b><font size=1>CONFIDENTIALITY INFORMATION AND DISCLAIMER:</font></b><br><font size=1 face=Verdana>This message contains information which may be confidential and privileged. Unless you are the addressee (or authorized to receive for the addressee), you may not use copy or disclose to anyone the message or any information contained in the message. If you have received the message in error, please advise the sender by reply e-mail and delete the message. Thank you...!!!</font></p><br><p><b>Note: This is a software generated mail. Please do not reply.</b></p></font></p></body></html>");

            string Subject = ProjectName + " - " + BillingPeriod + " - Billing rolled back to production";
            //ToAddress = "s.chandrakant@infinity-data.com";

            if (ToAddress == "")
            {
                ToAddress = "n.nilkanth@infinityinternationals.us";
            }
            StringBuilder body = new StringBuilder();
            body.Append(Header.Replace("Infinity Invoice", "Infinity Billing"));
            body.Append(htmlBody);
            body.Append(Footer);

            MailMessage mail = new MailMessage();
            mail.To.Add(ToAddress);
            if (ToCC != "")
                mail.CC.Add(ToCC);
            if (ToBCC != "")
                mail.Bcc.Add(ToBCC);
            mail.Bcc.Add("n.nilkanth@infinityinternationals.us");

            string Pass = new bllTracking().GetPassword("ack");

            mail.From = new MailAddress("ack@infinityinternationals.us", "Infinity Billing", System.Text.Encoding.UTF8);
            mail.Subject = Subject;
            mail.SubjectEncoding = System.Text.Encoding.UTF8;
            mail.Body = body.ToString();
            mail.BodyEncoding = System.Text.Encoding.UTF8;
            mail.IsBodyHtml = true;
            mail.Priority = System.Net.Mail.MailPriority.High;
            SmtpClient client = new SmtpClient();
            client.Credentials = new System.Net.NetworkCredential("ack@infinityinternationals.us", Pass);
            client.Host = "smtpcorp.netcore.co.in";
            try
            {
                client.Send(mail);
                returnvalue = 1;
            }
            catch
            {
                returnvalue = 0;
            }


            return returnvalue;
        }



        //protected void btn12_Click(object sender, EventArgs e)
        //{
        //    string Process = "";
        //    string Securitization = "";
        //    if (Convert.ToString(Request.QueryString["ProjectName"]).Contains("-"))
        //    {
        //        Process = Convert.ToString(Request.QueryString["ProjectName"]).Substring(Convert.ToString(Request.QueryString["ProjectName"]).IndexOf("-") + 1);
        //    }
        //    else
        //    {
        //        Process = BillingPeriod;
        //    }
        //    DataTable dtPreview = new bllTracking().GetInvoicePreview(int.Parse(ProjectID), Process, BillingPeriod, Convert.ToString(Request.Form["billdetails_header_totalamount"]));
        //    if (dtPreview != null)
        //    {
        //        if (dtPreview.Rows.Count > 0)
        //        {
        //            Securitization = Convert.ToString(dtPreview.Rows[0]["Securitization"]);
        //            InvoiceNumber = Convert.ToString(dtPreview.Rows[0]["InvoiceNumber"]);
        //        }
        //    }

        //    DataSet dt = new DataSet();

        //    ReportDocument rpt = new ReportDocument();
        //    if (Process != BillingPeriod)
        //        rpt.Load(Server.MapPath("~/Reports/PCQCSummary_Preview.rpt"));
        //    else if (Securitization == "Yes")
        //        rpt.Load(Server.MapPath("~/Reports/SecuritizationPreview.rpt"));
        //    else if (Securitization == "Rebuttal")
        //        rpt.Load(Server.MapPath("~/Reports/RebuttalPreview.rpt"));
        //    else if (Securitization == "Research")
        //        rpt.Load(Server.MapPath("~/Reports/Research_Preview.rpt"));
        //    else if (Securitization == "Inventory")
        //        rpt.Load(Server.MapPath("~/Reports/Inventory_Preview.rpt"));
        //    else if (Securitization == "642")
        //        rpt.Load(Server.MapPath("~/Reports/642_Preview.rpt"));
        //    else if (Securitization == "670")
        //        rpt.Load(Server.MapPath("~/Reports/670_Preview.rpt"));
        //    else if (int.Parse(ProjectID) == 70)
        //        rpt.Load(Server.MapPath("~/Reports/NewSummaryReport1561_Preview.rpt"));
        //    else if (int.Parse(ProjectID) == 512)
        //        rpt.Load(Server.MapPath("~/Reports/2091_Preview.rpt"));
        //    else
        //        rpt.Load(Server.MapPath("~/Reports/NewSummaryReport1_Preview.rpt"));


        //    CrystalDecisions.Shared.ParameterValues pval1 = new ParameterValues();
        //    CrystalDecisions.Shared.ParameterValues pval2 = new ParameterValues();
        //    CrystalDecisions.Shared.ParameterValues pval3 = new ParameterValues();
        //    CrystalDecisions.Shared.ParameterValues pval4 = new ParameterValues();
        //    CrystalDecisions.Shared.ParameterValues pval5 = new ParameterValues();
        //    CrystalDecisions.Shared.ParameterValues pval6 = new ParameterValues();
        //    CrystalDecisions.Shared.ParameterValues pval7 = new ParameterValues();

        //    ParameterDiscreteValue pdisval2 = new ParameterDiscreteValue();
        //    pdisval2.Value = ProjectID;
        //    pval2.Add(pdisval2);

        //    ParameterDiscreteValue pdisval3 = new ParameterDiscreteValue();
        //    pdisval3.Value = BillingPeriod;
        //    pval3.Add(pdisval3);

        //    ParameterDiscreteValue pdisval4 = new ParameterDiscreteValue();
        //    if (BillingPeriod != Process)
        //        pdisval4.Value = Process;
        //    else
        //        pdisval4.Value = "";
        //    pval4.Add(pdisval4);

        //    ParameterDiscreteValue pdisval5 = new ParameterDiscreteValue();
        //    pdisval5.Value = Convert.ToString(Request.Form["billdetails_header_totalamount"]);
        //    pval5.Add(pdisval5);

        //    ParameterDiscreteValue pdisval6 = new ParameterDiscreteValue();
        //    pdisval6.Value = Convert.ToString(Convert.ToString(Request.QueryString["Slot"]));
        //    pval7.Add(pdisval6);

        //    rpt.DataDefinition.ParameterFields["@ProjectID"].ApplyCurrentValues(pval2);
        //    rpt.DataDefinition.ParameterFields["@ProcessName"].ApplyCurrentValues(pval4);
        //    rpt.DataDefinition.ParameterFields["@BillingPeriod"].ApplyCurrentValues(pval3);
        //    rpt.DataDefinition.ParameterFields["@TotalCost"].ApplyCurrentValues(pval5);
        //    int chkSlot = new bllTracking().CheckSlotPassing(int.Parse(ProjectID), BillingPeriod, Process);
        //    if (chkSlot == 1)
        //        rpt.DataDefinition.ParameterFields["@Slot"].ApplyCurrentValues(pval7);

        //    CrystalDecisions.CrystalReports.Engine.ReportDocument reportDocument = new CrystalDecisions.CrystalReports.Engine.ReportDocument();
        //    CrystalDecisions.Shared.ConnectionInfo crConnectionInfo;
        //    CrystalDecisions.Shared.TableLogOnInfos crtableLogoninfos;
        //    CrystalDecisions.Shared.TableLogOnInfo crtableLogoninfo;
        //    CrystalDecisions.CrystalReports.Engine.Tables CrTables;
        //    crConnectionInfo = new CrystalDecisions.Shared.ConnectionInfo();
        //    crtableLogoninfos = new CrystalDecisions.Shared.TableLogOnInfos();
        //    crtableLogoninfo = new CrystalDecisions.Shared.TableLogOnInfo();

        //    crConnectionInfo.ServerName = ConfigurationManager.AppSettings["ServerName"];
        //    crConnectionInfo.DatabaseName = ConfigurationManager.AppSettings["DatabaseName"];
        //    crConnectionInfo.UserID = ConfigurationManager.AppSettings["UserID"];
        //    crConnectionInfo.Password = ConfigurationManager.AppSettings["Password"];

        //    CrTables = rpt.Database.Tables;

        //    foreach (CrystalDecisions.CrystalReports.Engine.Table CrTable in CrTables)
        //    {
        //        crtableLogoninfo = CrTable.LogOnInfo;
        //        crtableLogoninfo.ConnectionInfo = crConnectionInfo;
        //        CrTable.ApplyLogOnInfo(crtableLogoninfo);
        //    }


        //    crReport.RefreshReport();
        //    crReport.Visible = true;
        //    crReport.HasExportButton = false;
        //    crReport.HasPrintButton = false;
        //    crReport.HasPageNavigationButtons = true;
        //    crReport.HasCrystalLogo = false;
        //    crReport.HasDrillUpButton = false;
        //    crReport.HasSearchButton = false;

        //    crReport.HasToggleGroupTreeButton = false;
        //    crReport.HasZoomFactorList = false;
        //    crReport.ToolbarStyle.Width = new Unit("750px");
        //    crReport.ReportSource = rpt;
        //    string strDate = DateTime.Now.Year.ToString() + DateTime.Now.Month.ToString() + DateTime.Now.Day.ToString();
        //    string strTime = DateTime.Now.Hour.ToString() + DateTime.Now.Minute.ToString() + DateTime.Now.Second.ToString();
        //    string filename = ProjectID + "_" + BillingPeriod + "_" + strDate + strTime;
        //    try
        //    {
        //        InvoiceNumber = Convert.ToString(dtPreview.Rows[0]["InvoiceNumber"]);
        //    }
        //    catch { }
        //    if (InvoiceNumber == "")
        //    {
        //        InvoiceNumber = filename;
        //    }
        //    else
        //    {
        //        filename = InvoiceNumber;
        //    }
        //    filename = filename.Replace(",", "_");
        //    if (!Directory.Exists(Server.MapPath(@"~/BillingDocuments/")))
        //    {
        //        Directory.CreateDirectory(Server.MapPath(@"~/BillingDocuments/"));
        //    }
        //    string filePath =
        //        Server.MapPath("~/BillingDocuments/") + filename + ".pdf";

        //    int result = new bllTracking().InsertGroupAttachmentPath_PDf_Before(ProjectName + "-" + Process, BillingPeriod, Convert.ToString(@"~/BillingDocuments/" + filename + ".pdf"), InvoiceNumber);
        //    rpt.ExportToDisk(ExportFormatType.PortableDocFormat, filePath);

        //    rpt.ExportToHttpResponse(ExportFormatType.PortableDocFormat, Response, true, filename);
        //}
    }
}
