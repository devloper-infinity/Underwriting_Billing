using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace Vendor_Portal.BDM
{
    public partial class BDM : System.Web.UI.MasterPage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (int.Parse(HttpContext.Current.User.Identity.Name.ToString()) == 9978 || int.Parse(HttpContext.Current.User.Identity.Name.ToString()) == 9977 ||
                int.Parse(HttpContext.Current.User.Identity.Name.ToString()) == 9976 || int.Parse(HttpContext.Current.User.Identity.Name.ToString()) == 8967)
            {
                costingMaster.Style.Add("display", "none");
                //payingEntity.Style.Add("display", "none");
                mergebilling.Style.Add("display", "none");
                reports.Style.Add("display", "none");
            }
            else if (int.Parse(HttpContext.Current.User.Identity.Name.ToString()) == 12)
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
    }
}