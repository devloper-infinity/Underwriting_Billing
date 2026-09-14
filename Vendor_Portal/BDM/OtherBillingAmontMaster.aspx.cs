using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using Vendor_Portal.App_Code.BLL;

namespace Vendor_Portal.BDM
{
    public partial class OtherBillingAmontMaster : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }

        [WebMethod]
        public static string GetOtherAmount(string Month, string Year)
        {
            DataTable dt1 = new bllTracking().GetOtherAmount(Month, Year);
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

        //[WebMethod]

        [WebMethod]
        public static int UpdatePayentOtherAmount(string jsonData)
        {
            int returnvalue = 0;
            DataTable dt1 = new bllTracking().GetOtherAmount1(jsonData);

            return returnvalue;
        }
        //public static int UpdatePayentOtherAmount_Old(string Parameters)
        //{
        //    int returnvalue = 0;
        //    string Project = "";
        //    string BillingPeriod = "";
        //    string ChargeType = "";
        //    string Amount = "";
        //    string[] allparams = Parameters.Split(':');
        //    foreach (string paramlist in allparams)
        //    {
        //        if (paramlist == "561")
        //        {


        //        }
        //        else
        //        {
        //            string[] params1 = paramlist.Split('_');
        //            Project = "561";
        //            BillingPeriod = params1[0];
        //            ChargeType = params1[1];
        //            Amount = params1[3];
        //            Hashtable htParam = new Hashtable();
        //            htParam.Add("Project", Project);
        //            htParam.Add("BillingPeriod", BillingPeriod);
        //            htParam.Add("ChargeType", ChargeType);
        //            htParam.Add("Amount", Amount);
        //            returnvalue = new bllTracking().UpdateOtherBillingAmount(htParam);
        //        }
        //    }

        //    return returnvalue;
        //}
    }
}