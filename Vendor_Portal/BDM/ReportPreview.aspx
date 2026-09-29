<%@ Page Language="C#" %>
<%@ Import Namespace="System.IO" %>
<script runat="server">
    protected void Page_Load(object sender, EventArgs e)
    {
        string kind = (Request.QueryString["kind"] ?? "").ToLowerInvariant();
        string name = Path.GetFileName(Request.QueryString["file"] ?? "");
        string folder = "~/BillingDocuments/";
        string path = Server.MapPath(folder + name);
        if (kind != "pdf" || name == "" || !File.Exists(path)) { Response.StatusCode = 404; Response.End(); return; }

        Response.Clear();
        Response.ContentType = "application/pdf";
        Response.AddHeader("Content-Disposition", (Request.QueryString["download"] == "1" ? "attachment" : "inline") + "; filename=\"" + name.Replace("\"", "") + "\"");
        Response.TransmitFile(path);
        Response.End();
    }
</script>
