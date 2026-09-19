using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Web.Script.Serialization;
using System.Web.Services;
using System.Web.UI;
using Vendor_Portal.App_Code.BLL;

namespace Vendor_Portal.BDM
{
    public partial class AllVendorCosting : Page
    {
        protected void Page_Load(object sender, EventArgs e) { }

        [WebMethod]
        public static string GetReport(string periodAFrom, string periodATo, string periodBFrom, string periodBTo)
        {
            DateTime fromA = ParseDate(periodAFrom, "Period A From");
            DateTime toA = ParseDate(periodATo, "Period A To");
            if (fromA > toA) throw new ArgumentException("Period A start date must not be after its end date.");

            DateTime? fromB = ParseOptionalDate(periodBFrom, "Period B From");
            DateTime? toB = ParseOptionalDate(periodBTo, "Period B To");
            if (fromB.HasValue != toB.HasValue) throw new ArgumentException("Period B requires both dates.");
            if (fromB.HasValue && fromB.Value > toB.Value) throw new ArgumentException("Period B start date must not be after its end date.");

            DataSet data = new bllTracking().GetAllVendorCostingComparison(fromA, toA, fromB, toB);
            if (data == null || data.Tables.Count < 2)
                throw new InvalidOperationException("The report returned an unexpected result.");

            JavaScriptSerializer serializer = new JavaScriptSerializer { MaxJsonLength = Int32.MaxValue };
            return serializer.Serialize(new
            {
                Summary = Rows(data.Tables[0]),
                Detail = Rows(data.Tables[1])
            });
        }

        [WebMethod]
        public static string GetInvoiceDetails(string vendor, string project, string process, string fromDate, string toDate)
        {
            if (String.IsNullOrWhiteSpace(vendor)) throw new ArgumentException("Vendor is required.");
            DataTable data = new bllTracking().GetAllVendorCostingInvoiceDetails(vendor, project, process, ParseDate(fromDate, "From Date"), ParseDate(toDate, "To Date"));
            return new JavaScriptSerializer { MaxJsonLength = Int32.MaxValue }.Serialize(Rows(data));
        }

        private static DateTime ParseDate(string value, string field)
        {
            DateTime result;
            if (!DateTime.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out result))
                throw new ArgumentException(field + " is invalid.");
            return result;
        }

        private static DateTime? ParseOptionalDate(string value, string field)
        {
            return String.IsNullOrWhiteSpace(value) ? (DateTime?)null : ParseDate(value, field);
        }

        private static List<Dictionary<string, object>> Rows(DataTable table)
        {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            foreach (DataRow source in table.Rows)
            {
                Dictionary<string, object> row = new Dictionary<string, object>();
                foreach (DataColumn column in table.Columns)
                    row[column.ColumnName] = source[column] == DBNull.Value ? null : source[column];
                rows.Add(row);
            }
            return rows;
        }
    }
}
