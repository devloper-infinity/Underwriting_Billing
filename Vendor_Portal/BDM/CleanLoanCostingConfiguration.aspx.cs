using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Services;
using System.Web.UI;
using Vendor_Portal.App_Code.BLL;

namespace Vendor_Portal.BDM
{
    public partial class CleanLoanCostingConfiguration : Page
    {
        protected void Page_Load(object sender, EventArgs e) { }

        private static string Serialize(DataTable table)
        {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            if (table != null)
            {
                foreach (DataRow dataRow in table.Rows)
                {
                    Dictionary<string, object> row = new Dictionary<string, object>();
                    foreach (DataColumn column in table.Columns)
                        row[column.ColumnName] = dataRow[column] == DBNull.Value ? null : dataRow[column];
                    rows.Add(row);
                }
            }
            JavaScriptSerializer serializer = new JavaScriptSerializer { MaxJsonLength = int.MaxValue };
            return serializer.Serialize(rows);
        }

        [WebMethod]
        public static string clc_GetProjects()
        {
            return Serialize(new bllTracking().ViewAllProjectApp());
        }

        [WebMethod]
        public static string clc_GetDeals(int projectId)
        {
            if (projectId <= 0) throw new ArgumentException("A valid project is required.");
            return Serialize(new bllTracking().GetUWProcess(projectId));
        }

        [WebMethod]
        public static string clc_GetRecords()
        {
            return Serialize(new bllTracking().GetCleanLoanCosting());
        }

        [WebMethod]
        public static int clc_Save(int cleanLoanCostingId, int projectId, string costingLevel, string dealNo, string cleanLoanRate)
        {
            decimal rate;
            int employeeId;
            if (projectId <= 0) return -2;
            if (!Decimal.TryParse(cleanLoanRate, NumberStyles.Number, CultureInfo.InvariantCulture, out rate)) return -2;
            if (costingLevel != "Project" && costingLevel != "Deal") return -2;
            if (costingLevel == "Deal" && String.IsNullOrWhiteSpace(dealNo)) return -2;
            if (!Int32.TryParse(HttpContext.Current.User.Identity.Name, out employeeId)) return -4;

            return new bllTracking().InsertUpdateCleanLoanCosting(
                cleanLoanCostingId, projectId, costingLevel == "Project" ? null : dealNo, rate, employeeId);
        }

        [WebMethod]
        public static int clc_Delete(int cleanLoanCostingId)
        {
            if (cleanLoanCostingId <= 0) return -2;
            return new bllTracking().DeleteCleanLoanCosting(cleanLoanCostingId);
        }
    }
}
