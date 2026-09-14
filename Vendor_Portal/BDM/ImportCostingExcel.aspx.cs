using ClosedXML.Excel;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OleDb;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using Vendor_Portal.App_Code.BLL;

namespace Vendor_Portal.BDM
{
    public partial class ImportCostingExcel : System.Web.UI.Page
    {
        static string NewFileName = "";
        static string GUIDFile = "";
        static string FolderPath = "";
        protected void Page_Load(object sender, EventArgs e)
        {
            FolderPath = Server.MapPath(@"~\ReportDocument");
            try
            {
                HttpContext postedContext = HttpContext.Current;
                HttpPostedFile file = postedContext.Request.Files[0];

                string name = file.FileName;
                byte[] binaryWriteArray = new byte[file.InputStream.Length];
                file.InputStream.Read(binaryWriteArray, 0,
                (int)file.InputStream.Length);

                FileInfo file_Info = new FileInfo(file.FileName);
                string ext = file_Info.Extension;

                string file_Name = Guid.NewGuid().ToString() + "_" + DateTime.Now.Day + DateTime.Now.Month + DateTime.Now.Year + ext;
                NewFileName = Server.MapPath("..//TempFiles//" + file_Name);
                FileStream objfilestream = new FileStream(NewFileName, FileMode.Create, FileAccess.ReadWrite);
                objfilestream.Write(binaryWriteArray, 0,
                binaryWriteArray.Length);
                objfilestream.Close();
            }
            catch { }
        }

        public static DataTable ReadExcelToDataTable(string filePath, string sheetName = null)
        {
            DataTable dt = new DataTable();

            using (var workbook = new XLWorkbook(filePath))
            {
                // Get sheet either by name or first one
                var worksheet = string.IsNullOrEmpty(sheetName)
                    ? workbook.Worksheet(1)
                    : workbook.Worksheet(sheetName);

                bool firstRow = true;

                foreach (var row in worksheet.RowsUsed())
                {
                    if (firstRow)
                    {
                        // Use first row as column names
                        foreach (var cell in row.Cells())
                        {
                            dt.Columns.Add(cell.Value.ToString());
                        }
                        firstRow = false;
                    }
                    else
                    {
                        // Add data rows
                        var dataRow = dt.NewRow();
                        int i = 0;
                        foreach (var cell in row.Cells(1, dt.Columns.Count))
                        {
                            dataRow[i] = cell.Value.ToString();
                            i++;
                        }
                        dt.Rows.Add(dataRow);
                    }
                }
            }
            return dt;
        }


        [WebMethod]
        public static string ImportExcel()
        {
            string result = "";
            int Count = 0;
            if (NewFileName != "")
            {
                string Extn = NewFileName.Substring(NewFileName.LastIndexOf(".") + 1);
                string ConExcel;
                //if (Extn.Contains("xlsx"))
                //{
                //    ConExcel = "Provider=Microsoft.ACE.OLEDB.12.0;" + "Data Source=" + NewFileName + "; Extended Properties=\"Excel 12.0;HDR=YES;IMEX=1\"";
                //}
                //else
                //{
                //    ConExcel = "Provider=Microsoft.Jet.OLEDB.4.0;" + "Data Source=" + NewFileName + "; Extended Properties=\"Excel 8.0;HDR=Yes;IMEX=1\"";
                //}
                //DataSet dsExcel = new DataSet();
                DataTable Dt = new DataTable("[Sheet1$]");
                //using (OleDbConnection myExcelConnection = new OleDbConnection(ConExcel))
                //{
                //string sqlExcel = "";
                //sqlExcel = "Select [Project #],[Deal #],[Copy From] from [Sheet1$]";
                //OleDbDataAdapter daExcel = new OleDbDataAdapter(sqlExcel, myExcelConnection);
                //daExcel.Fill(dsExcel);
                //daExcel.Dispose();
                //Dt = dsExcel.Tables[0];
                Dt = ReadExcelToDataTable(NewFileName);
                Dt.Columns.Add("System Remark");

                //if (myExcelConnection.State == ConnectionState.Open)
                //{
                //    myExcelConnection.Close();
                //}
                try
                {
                    if (Dt.Columns[0].ToString() == "Project #" && Dt.Columns[1].ToString() == "Deal #" && Dt.Columns[2].ToString() == "Copy From")
                    {
                        for (int i = 0; i < Dt.Rows.Count; i++)
                        {
                            Count++;
                            try
                            {
                                int ProcessExists = new bllTracking().CheckProcessExistance(Convert.ToString(Dt.Rows[i]["Deal #"]));
                                if (ProcessExists == 0)
                                {
                                    Dt.Rows[i]["System Remark"] = "Deal/Process is already configured";
                                }
                                else
                                {
                                    Dt.Rows[i]["System Remark"] = "Verified. Ready to import";
                                }
                            }
                            catch { }
                        }
                        Dt.Columns["System Remark"].SetOrdinal(0);
                        Dt.AcceptChanges();
                        if (Count == Dt.Rows.Count)
                        {
                            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
                            Dictionary<string, object> row;
                            if (Dt != null)
                            {
                                foreach (DataRow dr in Dt.Rows)
                                {
                                    row = new Dictionary<string, object>();
                                    foreach (DataColumn col in Dt.Columns)
                                    {
                                        row.Add(col.ColumnName, dr[col]);
                                    }
                                    rows.Add(row);
                                }
                            }
                            JavaScriptSerializer ser = new JavaScriptSerializer();
                            ser.MaxJsonLength = int.MaxValue;
                            result = ser.Serialize(rows);
                        }
                    }
                    else
                    {
                        DataTable dtError = new DataTable();
                        dtError.Columns.Add("System Remark");
                        dtError.Columns.Add("Project #");
                        dtError.Columns.Add("Deal #");
                        dtError.Columns.Add("Copy From");
                        DataRow dr1 = dtError.NewRow();
                        dr1["System Remark"] = "Please check excel column header.";
                        dr1["Project #"] = "No Data";
                        dr1["Deal #"] = "No Data";
                        dr1["Copy From"] = "No Data";
                        dtError.Rows.Add(dr1);
                        List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
                        Dictionary<string, object> row;
                        if (dtError != null)
                        {
                            foreach (DataRow dr in dtError.Rows)
                            {
                                row = new Dictionary<string, object>();
                                foreach (DataColumn col in dtError.Columns)
                                {
                                    row.Add(col.ColumnName, dr[col]);
                                }
                                rows.Add(row);
                            }
                        }
                        JavaScriptSerializer ser = new JavaScriptSerializer();
                        ser.MaxJsonLength = int.MaxValue;
                        result = ser.Serialize(rows);
                    }
                }
                catch { }
                //}
            }
            return result;
        }

        [WebMethod]
        public static int VerifyAndImport()
        {
            int returnvalue = 0;
            if (NewFileName != "")
            {
                string Extn = NewFileName.Substring(NewFileName.LastIndexOf(".") + 1);
                string ConExcel;
                //if (Extn.Contains("xlsx"))
                //{
                //    ConExcel = "Provider=Microsoft.ACE.OLEDB.12.0;" + "Data Source=" + NewFileName + "; Extended Properties=\"Excel 12.0;HDR=YES;IMEX=1\"";
                //}
                //else
                //{
                //    ConExcel = "Provider=Microsoft.Jet.OLEDB.4.0;" + "Data Source=" + NewFileName + "; Extended Properties=\"Excel 8.0;HDR=Yes;IMEX=1\"";
                //}
                //DataSet dsExcel = new DataSet();
                DataTable Dt = new DataTable("[Sheet1$]");
                //using (OleDbConnection myExcelConnection = new OleDbConnection(ConExcel))
                //{
                string sqlExcel = "";
                //sqlExcel = "Select [Project #],[Deal #],[Copy From] from [Sheet1$]";
                //OleDbDataAdapter daExcel = new OleDbDataAdapter(sqlExcel, myExcelConnection);
                //daExcel.Fill(dsExcel);
                //daExcel.Dispose();
                Dt = ReadExcelToDataTable(NewFileName);
                Dt.Columns.Add("System Remark");

                //if (myExcelConnection.State == ConnectionState.Open)
                //{
                //    myExcelConnection.Close();
                //}
                try
                {
                    for (int i = 0; i < Dt.Rows.Count; i++)
                    {
                        string ProjectName = Convert.ToString(Dt.Rows[i]["Project #"]);
                        string ToDealNo = Convert.ToString(Dt.Rows[i]["Deal #"]);
                        string FromDealNo = Convert.ToString(Dt.Rows[i]["Copy From"]);
                        int AddedBy = int.Parse(HttpContext.Current.User.Identity.Name.ToString());
                        returnvalue = new bllTracking().InsertConfiguration(ProjectName, ToDealNo, FromDealNo, AddedBy);
                    }
                }
                catch { return 0; }
                //}
            }

            return returnvalue;
        }
    }
}