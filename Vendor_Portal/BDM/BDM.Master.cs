using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using Vendor_Portal.App_Code.BLL;

namespace Vendor_Portal.BDM
{
    public partial class BDM : System.Web.UI.MasterPage
    {
        public string DisplayFirstName { get; private set; }

        protected void Page_Load(object sender, EventArgs e)
        {
            int employeeId = int.Parse(HttpContext.Current.User.Identity.Name.ToString());
            DisplayFirstName = GetFirstName(employeeId);
            if (employeeId == 9978 || employeeId == 9977 || employeeId == 9976 || employeeId == 8967)
            {
                costingMaster.Style.Add("display", "none");
                //payingEntity.Style.Add("display", "none");
                mergebilling.Style.Add("display", "none");
                reports.Style.Add("display", "none");
            }
            else if (employeeId == 12)
            {
                costingMaster.Style.Add("display", "");
                //payingEntity.Style.Add("display", "none");
                mergebilling.Style.Add("display", "none");
                reports.Style.Add("display", "");
                dailyVolume.Visible = false;
            }
            else
            {
                costingMaster.Style.Add("display", "");
                //payingEntity.Style.Add("display", "");
                mergebilling.Style.Add("display", "");
                reports.Style.Add("display", "");
                dailyVolume.Visible = true;
            }
        }

        private string GetFirstName(int employeeId)
        {
            string cached = Convert.ToString(Session["FirstName"]);
            if (!String.IsNullOrWhiteSpace(cached)) return cached;
            DataTable user = new bllLogin().GetUserInformation(employeeId);
            if (user != null && user.Rows.Count > 0)
            {
                string[] columns = { "FirstName", "First_Name", "EmployeeName", "Name" };
                foreach (string column in columns)
                {
                    if (!user.Columns.Contains(column)) continue;
                    string value = Convert.ToString(user.Rows[0][column]).Trim();
                    if (value.Length == 0) continue;
                    cached = value.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries)[0];
                    Session["FirstName"] = cached;
                    return cached;
                }
            }
            return "User";
        }
    }
}
