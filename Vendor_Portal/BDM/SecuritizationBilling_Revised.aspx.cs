using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using Vendor_Portal.App_Code.BLL;

namespace Vendor_Portal.BDM
{
    public partial class SecuritizationBilling_Revised : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }

        [WebMethod]
        public static string GetSecuritization561Costing()
        {
            DataTable dt1 = new bllTracking().GetSecuritization561Costing();
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
        public static int InsertUpdateSecuritizationCosting(string Parameters)
        {
            int returnvalue = 0;
            string[] mainparams = Parameters.Split('|');
            foreach (string param1 in mainparams)
            {
                if (param1 != "")
                {
                    string[] paramlist = param1.Split(':');
                    Hashtable htParam = new Hashtable();
                    htParam.Add("Description", paramlist[0]);
                    htParam.Add("RatePerFile", paramlist[1] == "" ? "0" : paramlist[1]);
                    htParam.Add("HourlyRate", paramlist[2] == "" ? "0" : paramlist[2]);
                    htParam.Add("AddedBy", int.Parse(HttpContext.Current.User.Identity.Name.ToString()));
                    returnvalue = new bllTracking().InsertUpdateSecuritization561Costing(htParam);
                }
            }
            return returnvalue;
        }

        [WebMethod]
        public static int InsertSecuritization561Billing(string Description, string Parameters)
        {
            int returnvalue = 0;
            string[] mainparams = Parameters.Split('|');
            foreach (string param1 in mainparams)
            {
                if (param1 != "")
                {
                    string[] paramlist = param1.Split(':');
                    Hashtable htParam = new Hashtable();
                    htParam.Add("Month", paramlist[0]);
                    htParam.Add("Year", paramlist[1]);
                    htParam.Add("BillingPeriod", Description);
                    htParam.Add("Description", paramlist[2]);
                    htParam.Add("LoanCount", paramlist[3] == "" ? "0" : paramlist[3]);
                    htParam.Add("NoofHours", paramlist[4] == "" ? "0" : paramlist[4]);
                    htParam.Add("RatePerFile", paramlist[5] == "" ? "0" : paramlist[5]);
                    htParam.Add("HourlyRate", paramlist[6] == "" ? "0" : paramlist[6]);
                    htParam.Add("TotalAmount", paramlist[7] == "" ? "0" : paramlist[7]);
                    htParam.Add("AddedBy", int.Parse(HttpContext.Current.User.Identity.Name.ToString()));
                    returnvalue = new bllTracking().InsertSecuritization561Billing(htParam);
                }
            }
            return returnvalue;
        }
    }
}