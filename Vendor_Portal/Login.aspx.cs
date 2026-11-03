using System;
using System.Collections.Generic;
using System.Data;
using System.Configuration;
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
        public string localIP;
        private bool MfaEnabled
        {
            get { return string.Equals(ConfigurationManager.AppSettings["Mfa:Enabled"], "true", StringComparison.OrdinalIgnoreCase); }
        }
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
                    DataTable usr = bllLogin.GetUserById(ReturnValue, Filter.SQLInjectionFilter(userID), Filter.SQLInjectionFilter(encPassword));
                    if (usr.Rows.Count <= 0)
                        usr = bllLogin.GetUserById(ReturnValue, Filter.SQLInjectionFilter(userID), Filter.SQLInjectionFilter(pwd));
                    long employeeId = Convert.ToInt64(usr.Rows[0]["EmployeeId"]);
                    string role = Convert.ToString(usr.Rows[0]["Role"]);
                    bool mustResetPassword = pwd.IndexOf("INFINITY", StringComparison.OrdinalIgnoreCase) >= 0;

                    if (!MfaEnabled)
                    {
                        CompleteSignIn(employeeId, role, chkRemember.Checked, mustResetPassword);
                        return;
                    }

                    BeginMfaChallenge(employeeId, userID, role, chkRemember.Checked, mustResetPassword);
                }
            }
            catch (System.Threading.ThreadAbortException)
            {
                throw;
            }
            catch (Exception)
            {
                ShowError("We could not complete sign-in. Please try again or contact support.");
            }
        }

        private void BeginMfaChallenge(long employeeId, string userName, string role, bool rememberMe, bool mustResetPassword)
        {
            string protectedSecret = bllLogin.GetMfaSecret(employeeId);
            bool isEnrollment = string.IsNullOrWhiteSpace(protectedSecret);
            string secret = isEnrollment ? TotpAuthenticator.GenerateSecret() : TotpAuthenticator.UnprotectSecret(protectedSecret);

            Session["Mfa.EmployeeId"] = employeeId;
            Session["Mfa.UserName"] = userName;
            Session["Mfa.Role"] = role;
            Session["Mfa.RememberMe"] = rememberMe;
            Session["Mfa.MustResetPassword"] = mustResetPassword;
            Session["Mfa.Secret"] = secret;
            Session["Mfa.IsEnrollment"] = isEnrollment;
            Session["Mfa.Attempts"] = 0;

            credentialsPanel.Visible = false;
            mfaPanel.Visible = true;
            mfaEnrollmentPanel.Visible = isEnrollment;
            if (isEnrollment)
            {
                string issuer = ConfigurationManager.AppSettings["Mfa:Issuer"] ?? "Infinity IPS";
                mfaProvisioningUri.Value = TotpAuthenticator.BuildProvisioningUri(issuer, userName, secret);
                mfaManualKey.Text = HttpUtility.HtmlEncode(secret);
            }
        }

        protected void btnVerifyMfa_Click(object sender, EventArgs e)
        {
            if (!MfaEnabled || Session["Mfa.EmployeeId"] == null || Session["Mfa.Secret"] == null)
            {
                ClearMfaChallenge();
                Response.Redirect("~/Login.aspx", true);
                return;
            }

            string secret = Convert.ToString(Session["Mfa.Secret"]);
            if (!TotpAuthenticator.VerifyCode(secret, Request.Form["mfa_code"], DateTime.UtcNow))
            {
                int attempts = Convert.ToInt32(Session["Mfa.Attempts"] ?? 0) + 1;
                Session["Mfa.Attempts"] = attempts;
                if (attempts >= 5)
                {
                    ClearMfaChallenge();
                    credentialsPanel.Visible = true;
                    mfaPanel.Visible = false;
                    ShowError("Too many invalid authentication codes. Please sign in again.");
                    return;
                }
                ShowError("The authentication code is invalid or expired. Please try again.");
                credentialsPanel.Visible = false;
                mfaPanel.Visible = true;
                mfaEnrollmentPanel.Visible = Convert.ToBoolean(Session["Mfa.IsEnrollment"]);
                if (mfaEnrollmentPanel.Visible)
                {
                    string issuer = ConfigurationManager.AppSettings["Mfa:Issuer"] ?? "Infinity IPS";
                    string userName = Convert.ToString(Session["Mfa.UserName"]);
                    mfaProvisioningUri.Value = TotpAuthenticator.BuildProvisioningUri(issuer, userName, secret);
                    mfaManualKey.Text = HttpUtility.HtmlEncode(secret);
                }
                return;
            }

            long employeeId = Convert.ToInt64(Session["Mfa.EmployeeId"]);
            if (Convert.ToBoolean(Session["Mfa.IsEnrollment"]))
                bllLogin.EnableMfa(employeeId, TotpAuthenticator.ProtectSecret(secret));
            bllLogin.RecordMfaUse(employeeId);

            string role = Convert.ToString(Session["Mfa.Role"]);
            bool rememberMe = Convert.ToBoolean(Session["Mfa.RememberMe"]);
            bool mustResetPassword = Convert.ToBoolean(Session["Mfa.MustResetPassword"]);
            ClearMfaChallenge();
            CompleteSignIn(employeeId, role, rememberMe, mustResetPassword);
        }

        private void CompleteSignIn(long employeeId, string role, bool rememberMe, bool mustResetPassword)
        {
            FormsAuthenticationTicket ticket = new FormsAuthenticationTicket(1, employeeId.ToString(), DateTime.Now,
                DateTime.Now.AddMinutes(30), rememberMe, role, FormsAuthentication.FormsCookiePath);
            HttpCookie authCookie = new HttpCookie(FormsAuthentication.FormsCookieName, FormsAuthentication.Encrypt(ticket));
            authCookie.HttpOnly = true;
            authCookie.Secure = Request.IsSecureConnection;
            authCookie.SameSite = SameSiteMode.Lax;
            if (ticket.IsPersistent) authCookie.Expires = ticket.Expiration;
            Response.Cookies.Add(authCookie);

            if (mustResetPassword)
                Response.Redirect("~/ResetPassword.aspx", true);
            else if (!string.IsNullOrEmpty(returnUrl) && UrlIsLocal(returnUrl))
                Response.Redirect(returnUrl, true);
            else
                Response.Redirect("~/Login.aspx", true);
        }

        private bool UrlIsLocal(string url)
        {
            return !string.IsNullOrEmpty(url) && url[0] == '/' && (url.Length == 1 || (url[1] != '/' && url[1] != '\\'));
        }

        private void ClearMfaChallenge()
        {
            string[] keys = { "Mfa.EmployeeId", "Mfa.UserName", "Mfa.Role", "Mfa.RememberMe", "Mfa.MustResetPassword", "Mfa.Secret", "Mfa.IsEnrollment", "Mfa.Attempts" };
            foreach (string key in keys) Session.Remove(key);
        }

        private void ShowError(string message)
        {
            dvError.Style["display"] = "";
            dvError.Attributes["class"] = "alert alert-danger background-danger";
            dvError.InnerText = message;
        }
    }
}
