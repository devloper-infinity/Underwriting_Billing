using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using Vendor_Portal.App_Code.BLL;
using Vendor_Portal.App_Code.EL;

namespace Vendor_Portal
{
    public partial class Login : System.Web.UI.Page
    {
        bllLogin bllLogin = new bllLogin();
        string Password = "";
        public string localIP;
        private string returnUrl
        {
            get
            {
                if (ViewState["returnUrl"] == null)
                    ViewState["returnUrl"] = "";
                return (string)ViewState["returnUrl"];
            }
            set
            {
                ViewState["returnUrl"] = value;
            }
        }

        protected void Page_Load(object sender, EventArgs e)
        {
            var remoteIpAddress = Request.UserHostAddress;
            try
            {
                returnUrl = Request.QueryString["ReturnUrl"];
            }
            catch { }

            if (HttpContext.Current.User.Identity.IsAuthenticated)
            {
                if (string.IsNullOrEmpty(returnUrl))
                {
                    string restFlag = Convert.ToString(Session["resetFlg"]);

                    if (restFlag == "False" || restFlag == "false")
                    {
                        if (HttpContext.Current.User.IsInRole("Admin"))
                        {
                            Session["User"] = "Admin";
                            if (HttpContext.Current.User.IsInRole("Admin"))
                                Response.Redirect("~/BDM/Dashboard.aspx");
                        }
                    }
                    else
                    {
                        if (HttpContext.Current.User.IsInRole("Admin"))
                        {
                            if (HttpContext.Current.User.IsInRole("Admin"))
                                Response.Redirect("~/BDM/Dashboard.aspx");
                        }

                        else
                        {
                            FormsAuthentication.SignOut();
                            Response.Redirect("~/Logout.aspx");
                        }
                    }
                }
                Response.Redirect(returnUrl);
            }


        }

        protected void btnLogin_Click(object sender, EventArgs e)
        {
            try
            {

                string userID = Request.Form["login_username"];
                string pwd = Request.Form["login_password"];


                if (chkRemember.Checked == true)
                {
                    Response.Cookies["userid"].Value = userID;
                    Response.Cookies["pwd"].Value = pwd;
                    Response.Cookies["userid"].Expires = DateTime.Now.AddMinutes(30);
                    Response.Cookies["pwd"].Expires = DateTime.Now.AddMinutes(30);
                }

                else
                {
                    Response.Cookies["userid"].Expires = DateTime.Now.AddMinutes(-1);

                    Response.Cookies["pwd"].Expires = DateTime.Now.AddMinutes(-1);
                }

                //********** Block User Login **********//
                DataTable dt = bllLogin.BlockUserLogin(userID);
                string encPassword = bllLogin.Encrypt(pwd);
                int ReturnValue = 0;

                int ReturnValue2 = bllLogin.ValidateUser(Filter.SQLInjectionFilter(userID), Filter.SQLInjectionFilter(encPassword));
                if (ReturnValue2 == 0)
                {
                    ReturnValue = bllLogin.ValidateUser(Filter.SQLInjectionFilter(userID), Filter.SQLInjectionFilter(pwd));
                }
                else
                {
                    ReturnValue = ReturnValue2;
                }
                //ReturnValue = bllLogin.ValidateUser(Filter.SQLInjectionFilter(userID), Filter.SQLInjectionFilter(pwd));

                if (ReturnValue == -1)
                {
                    dvError.Style.Add("display", "");
                    dvError.Attributes.Add("class", "alert alert-danger background-danger");
                    dvError.InnerHtml = "User does not exists";
                }
                else if (ReturnValue == 0)
                {
                    dvError.Style.Add("display", "");
                    dvError.Attributes.Add("class", "alert alert-danger background-danger");
                    dvError.InnerHtml = "Invalid Password";
                }

                else if (dt.Rows.Count > 0)
                {
                    dvError.Style.Add("display", "");
                    dvError.Attributes.Add("class", "alert alert-danger background-danger");
                    dvError.InnerHtml = "<b>Your login has been blocked. <br/>Please contact your reporting manager.</b>";
                }
                else
                {

                    FormsAuthenticationTicket Authticket = null;
                    DataTable usr = bllLogin.GetUserById(ReturnValue, Filter.SQLInjectionFilter(userID), Filter.SQLInjectionFilter(encPassword));
                    if (usr.Rows.Count <= 0)
                        usr = bllLogin.GetUserById(ReturnValue, Filter.SQLInjectionFilter(userID), Filter.SQLInjectionFilter(pwd));

                    Authticket = new FormsAuthenticationTicket(
                                                            1,
                                                            Convert.ToString(usr.Rows[0]["EmployeeId"]), //UID
                                                            DateTime.Now,
                                                            DateTime.Now.AddMinutes(30),
                                                            chkRemember.Checked, //Remember Me
                                                            Convert.ToString(usr.Rows[0]["Role"]), //ROLE
                                                            FormsAuthentication.FormsCookiePath);
                    string hash = FormsAuthentication.Encrypt(Authticket);
                    HttpCookie Authcookie = new HttpCookie(FormsAuthentication.FormsCookieName, hash);
                    if (Authticket.IsPersistent) Authcookie.Expires = Authticket.Expiration;
                    Response.Cookies.Add(Authcookie);

                    bool IsTrue = false;
                    try
                    {
                        IsTrue = pwd.ToUpper().Contains("INFINITY");
                    }
                    catch { }

                    if (IsTrue == true)
                    {
                        Response.Redirect("~/ResetPassword.aspx");
                    }
                    if (returnUrl == null)
                    {
                        Response.Redirect("~/Login.aspx", true);
                    }
                    else
                    {
                        Response.Redirect("~/Login.aspx?ReturnUrl=" + returnUrl, true);
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }
    }
}