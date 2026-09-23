<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Login.aspx.cs" Inherits="Vendor_Portal.Login" %>
<%@ Register Assembly="AjaxControlToolkit" Namespace="AjaxControlToolkit" TagPrefix="asp" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sign in | Infinity IPS</title>
    <link rel="stylesheet" href="plugins/fontawesome-free/css/all.min.css" />
    <link rel="stylesheet" href="dist/css/adminlte.min.css" />
    <link rel="stylesheet" href="dist/css/bdm-portal.css?v=3" />
    <script>
        function login_submit() {
            var username = document.getElementById('login_username');
            var password = document.getElementById('login_password');
            if (!username.value.trim()) { alert('Please enter username'); username.focus(); return false; }
            if (!password.value) { alert('Please enter password'); password.focus(); return false; }
            __doPostBack('<%= btnLogin.UniqueID %>', '');
            return false;
        }
    </script>
</head>
<body class="bdm-login">
    <main class="bdm-login-layout">
        <section class="bdm-login-intro" aria-label="Infinity IPS Client Billing Portal">
            <div class="bdm-login-intro-content">
                <span class="bdm-login-mark"><img src="images/logo.png" alt="Infinity IPS" /></span>
                <p class="bdm-login-eyebrow">INFINITY IPS</p>
                <h1>Client Billing<br />made clear.</h1>
                <p class="bdm-login-summary">A secure workspace for billing operations, costing configuration, invoice tracking, and management reporting.</p>
                <div class="bdm-login-features">
                    <span><i class="fas fa-chart-line"></i> Management reports</span>
                    <span><i class="fas fa-file-invoice-dollar"></i> Billing workflows</span>
                    <span><i class="fas fa-shield-alt"></i> Secure access</span>
                </div>
            </div>
        </section>
        <section class="bdm-login-panel">
            <div class="bdm-login-card">
                <div class="bdm-login-mobile-brand"><img src="images/logo.png" alt="Infinity IPS" /><strong>Infinity IPS</strong></div>
                <p class="bdm-login-kicker">WELCOME BACK</p>
                <h2>Sign in to your account</h2>
                <p class="bdm-login-help">Enter your credentials to continue to the Client Billing Portal.</p>
                <div id="dvError" runat="server" role="alert"></div>
                <form id="form1" runat="server">
                    <asp:Button ID="btnLogin" runat="server" OnClick="btnLogin_Click" Style="display:none" />
                    <asp:ToolkitScriptManager ID="ToolkitScriptManager1" runat="server" EnablePageMethods="true">
                        <Scripts><asp:ScriptReference Path="~/Scripts/Functions/Login.js" /></Scripts>
                    </asp:ToolkitScriptManager>
                    <div class="bdm-login-field">
                        <label for="login_username">Username</label>
                        <div class="bdm-login-input"><i class="fas fa-user"></i><input type="text" id="login_username" name="login_username" autocomplete="username" placeholder="Enter username" required /></div>
                    </div>
                    <div class="bdm-login-field">
                        <label for="login_password">Password</label>
                        <div class="bdm-login-input"><i class="fas fa-lock"></i><input type="password" id="login_password" name="login_password" autocomplete="current-password" placeholder="Enter password" required /></div>
                    </div>
                    <input type="checkbox" id="chkRemember" runat="server" style="display:none" />
                    <button id="login_btnsubmit" name="login_btnsubmit" class="bdm-login-button" onclick="return login_submit();">Sign in <i class="fas fa-arrow-right"></i></button>
                </form>
                <p class="bdm-login-note"><i class="fas fa-lock"></i> Your connection is protected and monitored.</p>
            </div>
        </section>
    </main>
    <script src="plugins/jquery/jquery.min.js"></script>
    <script src="plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="dist/js/adminlte.min.js"></script>
</body>
</html>
