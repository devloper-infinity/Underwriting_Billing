using Spire.Xls;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using Vendor_Portal.App_Code.BLL;
using Excel = Microsoft.Office.Interop.Excel;

namespace Vendor_Portal.BDM
{
    public partial class CostPerRecordReport : System.Web.UI.Page
    {
        static DataTable dtUser = new DataTable();
        static DataTable dtDomain = new DataTable();
        static DataTable dtProject = new DataTable();
        static string FileName = "";
        static Workbook book = new Workbook();
        static Worksheet sheet;
        protected void Page_Load(object sender, EventArgs e)
        {

        }

        private static string SerializeTable(DataTable table)
        {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            if (table != null)
            {
                foreach (DataRow dataRow in table.Rows)
                {
                    Dictionary<string, object> row = new Dictionary<string, object>();
                    foreach (DataColumn column in table.Columns)
                    {
                        row[column.ColumnName] = dataRow[column] == DBNull.Value ? null : dataRow[column];
                    }
                    rows.Add(row);
                }
            }

            JavaScriptSerializer serializer = new JavaScriptSerializer();
            serializer.MaxJsonLength = int.MaxValue;
            return serializer.Serialize(rows);
        }

        private static string CurrentUserName()
        {
            string name = HttpContext.Current.User.Identity.Name;
            return String.IsNullOrWhiteSpace(name) ? "Unknown" : name;
        }

        [WebMethod]
        public static string GetCostingHeaders()
        {
            return SerializeTable(new bllTracking().GetCostingHeaders());
        }

        [WebMethod]
        public static int SaveCostingHeader(string headerName)
        {
            headerName = (headerName ?? String.Empty).Trim();
            if (headerName.Length == 0 || headerName.Length > 200)
            {
                throw new ArgumentException("Costing Header is required and cannot exceed 200 characters.");
            }

            try
            {
                return new bllTracking().InsertCostingHeader(headerName, CurrentUserName());
            }
            catch (SqlException ex)
            {
                if (ex.Number == 2601 || ex.Number == 2627)
                {
                    throw new InvalidOperationException("This Costing Header already exists.");
                }
                throw;
            }
        }

        [WebMethod]
        public static string GetCostingEntries()
        {
            return SerializeTable(new bllTracking().GetCostingEntries());
        }

        [WebMethod]
        public static string GetCostingProjects()
        {
            return SerializeTable(new bllTracking().GetAllProjectByUserRights());
        }

        private static Dictionary<int, string> GetProjectDictionary()
        {
            DataTable table = new bllTracking().GetAllProjectByUserRights();
            Dictionary<int, string> projects = new Dictionary<int, string>();
            if (table == null || !table.Columns.Contains("ProjectID")) return projects;
            string nameColumn = table.Columns.Contains("ProjectName") ? "ProjectName" :
                (table.Columns.Contains("ProjectName1") ? "ProjectName1" :
                (table.Columns.Contains("Project") ? "Project" : null));
            if (nameColumn == null) return projects;
            foreach (DataRow row in table.Rows)
            {
                int id;
                if (Int32.TryParse(Convert.ToString(row["ProjectID"]), out id) && id > 0)
                    projects[id] = Convert.ToString(row[nameColumn]);
            }
            return projects;
        }

        [WebMethod]
        public static int SaveCosting(int month, int year, int costingHeaderId, decimal amount,
            bool appliesToAllProjects, int[] projectIds)
        {
            if (month < 1 || month > 12)
            {
                throw new ArgumentException("Please select a valid month.");
            }
            if (year < 2000 || year > 9999)
            {
                throw new ArgumentException("Please select a valid year.");
            }
            if (costingHeaderId <= 0)
            {
                throw new ArgumentException("Please select a Costing Header.");
            }
            if (amount < 0)
            {
                throw new ArgumentException("Amount cannot be negative.");
            }

            List<KeyValuePair<int, string>> selectedProjects = new List<KeyValuePair<int, string>>();
            if (!appliesToAllProjects)
            {
                int[] selectedIds = (projectIds ?? new int[0]).Distinct().ToArray();
                if (selectedIds.Length == 0 || selectedIds.Length > 1000)
                    throw new ArgumentException("Please select at least one valid Project.");
                Dictionary<int, string> availableProjects = GetProjectDictionary();
                foreach (int projectId in selectedIds)
                {
                    string projectName;
                    if (!availableProjects.TryGetValue(projectId, out projectName))
                        throw new ArgumentException("One or more selected Projects are invalid.");
                    selectedProjects.Add(new KeyValuePair<int, string>(projectId, projectName));
                }
            }

            try
            {
                return new bllTracking().InsertCosting(month, year, costingHeaderId, amount,
                    appliesToAllProjects, selectedProjects, CurrentUserName());
            }
            catch (SqlException ex)
            {
                if (ex.Number == 2601 || ex.Number == 2627)
                {
                    throw new InvalidOperationException("Costing already exists for the selected month, year, header and project.");
                }
                throw;
            }
        }

        [WebMethod]
        public static string GetCostingHistory(int costingId)
        {
            if (costingId <= 0)
            {
                throw new ArgumentException("Invalid costing record.");
            }
            return SerializeTable(new bllTracking().GetCostingHistory(costingId));
        }

        [WebMethod]
        public static string GetCostPerRecord_Userwise(string Month, string Year)
        {
            DataSet ds = new bllTracking().GetCostPerRecordReport(Month, Year);
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            Dictionary<string, object> row;
            if (ds != null)
            {
                dtUser = ds.Tables[0];
                dtDomain = ds.Tables[1];
                dtProject = ds.Tables[2];

                if (dtUser != null)
                {
                    foreach (DataRow dr in dtUser.Rows)
                    {
                        row = new Dictionary<string, object>();
                        foreach (DataColumn col in dtUser.Columns)
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
        public static string GetCostPerRecord_Domain(string Month, string Year)
        {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            Dictionary<string, object> row;
            if (dtDomain != null)
            {
                foreach (DataRow dr in dtDomain.Rows)
                {
                    row = new Dictionary<string, object>();
                    foreach (DataColumn col in dtDomain.Columns)
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
        public static string GetCostPerRecord_Project(string Month, string Year)
        {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            Dictionary<string, object> row;
            if (dtProject != null)
            {
                try
                {
                    dtProject.Columns.Remove("ProjectID");
                }
                catch { }
                foreach (DataRow dr in dtProject.Rows)
                {
                    row = new Dictionary<string, object>();
                    foreach (DataColumn col in dtProject.Columns)
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

        static string GetColumnName(int index)
        {
            const string letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

            var value = "";

            if (index >= letters.Length)
                value += letters[index / letters.Length - 1];

            value += letters[index % letters.Length];

            return value;
        }

        [WebMethod]
        public static int UserwiseReport(string Month, string Year)
        {
            int returnvalue = 1;
            FileName = HttpContext.Current.Server.MapPath(@"~\ReportDocument\Cost Per Record - " + Month + "_" + Year + ".xlsx");
            book = new Workbook();
            book.DefaultFontSize = 10;
            book.DefaultFontName = "Aptos Narrow";

            int rowcount = 0;
            int colcount = 0;
            sheet = null;
            sheet = book.Worksheets.Add("Userwise");
            DataSet ds = new bllTracking().GetCostPerRecordReport(Month, Year);
            if (ds != null)
            {
                dtUser = ds.Tables[0];
                dtDomain = ds.Tables[1];
                dtProject = ds.Tables[2];
                if (dtUser != null)
                {
                    sheet.InsertDataTable(dtUser, true, 1, 1);
                    string Col = GetColumnName(dtUser.Columns.Count - 1);
                    CellRange range = sheet.Range["A1:" + Col + "1"];
                    HeaderFormat_Static(range);
                    range = sheet.Range["A1:" + Col + (dtUser.Rows.Count + 1)];
                    AllBorder_Static(range);
                    ContentCenter_Static(range);
                    rowcount = sheet.LastRow;
                    colcount = sheet.LastColumn;

                    sheet.AllocatedRange.Style.Font.FontName = "Aptos Narrow";
                    sheet.AllocatedRange.Style.Font.Size = 10;

                    sheet.AllocatedRange.AutoFitColumns();
                    sheet.AllocatedRange.AutoFitRows();
                }
            }
            return returnvalue;
        }

        [WebMethod]
        public static int DomainwiseReport(string Month, string Year)
        {
            int returnvalue = 1;

            int rowcount = 0;
            int colcount = 0;
            sheet = null;
            sheet = book.Worksheets.Add("Domainwise");
            if (dtDomain != null)
            {

                sheet.InsertDataTable(dtDomain, true, 1, 1);
                string Col = GetColumnName(dtDomain.Columns.Count - 1);
                CellRange range = sheet.Range["A1:" + Col + "1"];
                HeaderFormat_Static(range);
                range = sheet.Range["A1:" + Col + (dtDomain.Rows.Count + 1)];
                AllBorder_Static(range);
                ContentCenter_Static(range);
                rowcount = sheet.LastRow;
                colcount = sheet.LastColumn;

                sheet.AllocatedRange.Style.Font.FontName = "Aptos Narrow";
                sheet.AllocatedRange.Style.Font.Size = 10;

                sheet.AllocatedRange.AutoFitColumns();
                sheet.AllocatedRange.AutoFitRows();
            }
            return returnvalue;
        }

        [WebMethod]
        public static int ProjectwiseReport(string Month, string Year)
        {
            int returnvalue = 1;

            int rowcount = 0;
            int colcount = 0;
            sheet = null;
            sheet = book.Worksheets.Add("Projectwise");
            if (dtProject != null)
            {
                try
                {
                    dtProject.Columns.Remove("ProjectID");
                }
                catch { }
                sheet.InsertDataTable(dtProject, true, 1, 1);
                string Col = GetColumnName(dtProject.Columns.Count - 1);
                CellRange range = sheet.Range["A1:" + Col + "1"];
                HeaderFormat_Static(range);
                range = sheet.Range["A1:" + Col + (dtProject.Rows.Count + 1)];
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

            return returnvalue;
        }


        protected void btn1_Click(object sender, EventArgs e)
        {
            Excel.Application xlApp = new Microsoft.Office.Interop.Excel.Application();
            if (xlApp == null)
            {
                return;
            }
            xlApp.DisplayAlerts = false;
            Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(FileName);
            System.Threading.Thread.Sleep(1000);
            Excel.Sheets worksheets = xlWorkBook.Worksheets;
            worksheets[1].Delete();
            worksheets[1].Delete();
            worksheets[1].Delete();
            worksheets[4].Delete();
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
    }
}
