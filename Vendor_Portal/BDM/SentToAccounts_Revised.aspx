<%@ Page Title="" Language="C#" MasterPageFile="~/BDM/BDM.Master" AutoEventWireup="true" CodeBehind="SentToAccounts_Revised.aspx.cs" Inherits="Vendor_Portal.BDM.SentToAccounts_Revised" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <style>
        .loading {
            display: none;
            position: fixed;
            top: 350px;
            left: 50%;
            margin-top: -96px;
            margin-left: -96px;
            /*  background-color: #ccc;*/
            opacity: .85;
            border-radius: 25px;
            width: 192px;
            height: 192px;
            z-index: 99999;
        }

        .dataTables_length, .dataTables_info {
            float: left !important;
        }

        label:not(.form-check-label):not(.custom-file-label) {
            font-weight: normal !important;
            border: none !important;
        }

        div.dt-buttons {
            position: static;
            padding-left: 50px;
            float: left;
        }

        .buttons-excel, .buttons-html5 {
            color: #fff;
            /*     background-color: #28a745;
            border-color: #28a745;*/
            box-shadow: none;
            background: linear-gradient(to right, #ffbf96, #fe7096);
            border: 0;
            font-weight: bold;
            margin: 0px 10px;
        }

        .table.dataTable th {
            background: linear-gradient(to bottom, #cbd0dd, 3%, #fff) !important;
            /*background-color:#e3e6ed!important;*/
            color: #000;
        }

        .table.dataTable tr td {
            background: none !important;
            background-color: #fff !important;
        }

        /*.form-control {
            font-size: 11px !important;
        }*/

        #otherBillingAmountsSection .other-billing-remove-cell { width: 90px; text-align: center; }
    </style>
    <script type="text/javascript">

        $(document).ready(function () {
            BindBillingDetailsHeader();
            BindBillingDataGrid_Revised();
            //senttoaccount_eGetVerifiedStatus();
            senttoaccount_generateinvoicenumber();
            otherBillingAmounts_initialize();
            var CurrentUser = "<%=HttpContext.Current.User.Identity.Name.ToString() %>";
            if (CurrentUser == 5 || CurrentUser == 235) {
                document.getElementById("senttoaccount_btnsendtoclient").style.display = '';
            }
            else {
                document.getElementById("senttoaccount_btnsendtoclient").style.display = 'none';
            }
        });

        function downloadreport() {
            document.getElementById("<%= btndownload.ClientID %>").click();
        }
        function showReportPreview(url, title) {
            $('#reportPreviewTitle').text(title);
            $('#reportPreviewFrame').attr('src', url);
            $('#reportPreviewDownload').attr('href', url + '&download=1');
            $('#reportPreviewModal').modal('show');
        }
        function exportloanlist_senttoaccount() {
            document.getElementById("<%= btn1_excel.ClientID %>").click();
            return false;
        }

        var otherBillingTypes = [];
        var pendingOtherBillingAction = null;

        function otherBillingAmounts_pageContext() {
            var parameters = new URLSearchParams(window.location.search);
            return {
                projectId: parseInt(parameters.get('ProjectID'), 10),
                projectName: parameters.get('ProjectName') || '',
                billingPeriod: parameters.get('BillingPeriod') || ''
            };
        }

        function otherBillingAmounts_initialize() {
            var context = otherBillingAmounts_pageContext();
            if (!context.billingPeriod.includes("~")) return;
            if (context.projectName !== '561') return;
            $('#otherBillingAmountsSection').show();
            PageMethods.GetOtherBillingAmounts(context.projectId, context.billingPeriod, otherBillingAmounts_loaded, otherBillingAmounts_error);
        }

        function otherBillingAmounts_loaded(result) {
            otherBillingTypes = result.BillingTypes || [];
            $('#otherBillingAmountsBody').empty();
            $.each(result.Records || [], function (_, row) { otherBillingAmounts_addRow(row); });
        }

        function otherBillingAmounts_encode(value) {
            return $('<div/>').text(value == null ? '' : value).html();
        }

        function otherBillingAmounts_addRow(row) {
            row = row || {};
            $('#otherBillingAmountsBody').append(
                '<tr class="other-billing-row" data-id="' + (row.Id || 0) + '">' +
                '<td><input type="text" class="form-control other-billing-type" value="' + otherBillingAmounts_encode(row.BillingType || '') + '" /></td>' +
                '<td><input type="number" min="0.01" step="0.01" class="form-control other-billing-amount" value="' + otherBillingAmounts_encode(row.Amount || '') + '" /></td>' +
                '<td><input type="text" class="form-control other-billing-display-name" value="' + otherBillingAmounts_encode(row.InvoiceDisplayName || '') + '" /></td>' +
                '<td class="other-billing-remove-cell"><button type="button" class="btn btn-sm btn-danger other-billing-remove">Remove</button></td></tr>');
        }

        $(document).on('click', '.other-billing-remove', function () { $(this).closest('tr').remove(); });

        function otherBillingAmounts_save() {
            var context = otherBillingAmounts_pageContext(), rows = [], valid = true, usedTypes = {};
            $('.other-billing-row').each(function () {
                var type = $.trim($(this).find('.other-billing-type').val());
                var amountText = $.trim($(this).find('.other-billing-amount').val());
                var displayName = $.trim($(this).find('.other-billing-display-name').val());
                var amount = Number(amountText);
                if (!type || !amountText || !isFinite(amount) || amount <= 0 || !displayName || usedTypes[type.toLowerCase()]) valid = false;
                usedTypes[type.toLowerCase()] = true;
                rows.push({ Id: Number($(this).data('id') || 0), BillingType: type, Amount: amount, InvoiceDisplayName: displayName });
            });
            if (!valid) {
                alert('Complete every row with a unique Billing Type, a numeric Amount greater than zero, and an Invoice Display Name.');
                return false;
            }
            PageMethods.SaveOtherBillingAmounts(context.projectId, context.billingPeriod, rows, function () {
                alert('Other Billing Amounts saved successfully.');
                otherBillingAmounts_initialize();
            }, otherBillingAmounts_error);
            return false;
        }

        function otherBillingAmounts_error(error) {
            alert(error.get_message ? error.get_message() : 'Unable to process Other Billing Amounts.');
        }

        function otherBillingAmounts_checkBefore(action) {
            var context = otherBillingAmounts_pageContext();
            if (context.projectName !== '561') return action();
            PageMethods.CheckOtherBillingAmountExists(context.projectId, context.billingPeriod, function (exists) {
                if (exists) action();
                else {
                    pendingOtherBillingAction = action;
                    $('#otherBillingAmountWarningModal').modal({ backdrop: 'static', keyboard: false });
                }
            }, otherBillingAmounts_error);
            return false;
        }

        function senttoaccount_previewinvoice_with_other_billing_check() {
            return otherBillingAmounts_checkBefore(function () { return senttoaccount_previewinvoice(); });
        }

        function senttoaccount_senttoclient_with_other_billing_check() {
            return otherBillingAmounts_checkBefore(function () { return senttoaccount_senttoclient(); });
        }

        function otherBillingAmounts_continuePendingAction() {
            var action = pendingOtherBillingAction;
            pendingOtherBillingAction = null;
            $('#otherBillingAmountWarningModal').modal('hide');
            if (action) action();
        }

    </script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <asp:Button ID="btndownload" runat="server" Style="display: none;" OnClick="btndownload_Click" />
    <asp:Button ID="btn1_excel" runat="server" Style="display: none;" OnClick="btn1_Click" />
    <div class="loading" id="load1">
        <img src="../images/Load_1.gif" />
        <div style="font-size: 12px; font-weight: bold;">One moment, please . . . .</div>
    </div>
    <div class="modal fade bdm-report-modal" id="reportPreviewModal" tabindex="-1">
        <div class="modal-dialog modal-xl"><div class="modal-content">
            <div class="modal-header"><h4 class="modal-title" id="reportPreviewTitle">Invoice Preview</h4><button type="button" class="close" data-dismiss="modal">&times;</button></div>
            <div class="modal-body p-2"><iframe id="reportPreviewFrame" title="Invoice preview"></iframe></div>
            <div class="modal-footer"><a id="reportPreviewDownload" class="btn btn-primary"><i class="fas fa-download"></i>&nbsp; Download</a><button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button></div>
        </div></div>
    </div>
    <div class="content-header">
        <div class="container">
            <div class="row mb-2 callout callout-info">
                <div class="col-sm-12">
                    <h6 class="m-0" style="font-weight: bold!important; display: inline;" id="billdetails_header_projectno"></h6>
                    <h6 class="m-0" style="font-weight: bold!important; display: inline; padding-left: 20px;" id="billdetails_header_billingperiod"></h6>
                    <h6 class="m-0" style="font-weight: bold!important; display: inline; padding-left: 20px;" id="billdetails_header_ordercount"></h6>
                    <h6 class="m-0" style="font-weight: bold!important; display: inline; padding-left: 20px;" id="billdetails_header_totalamount"></h6>
                    <h6 class="m-0" style="font-weight: bold!important; display: inline; padding-left: 20px; display: none;" id="billdetails_header_totalamount_hidden"></h6>
                    <ol class="breadcrumb float-sm-right" style="font-size: 12px; font-weight: bold;">
                        <li class="breadcrumb-item"><a href="Yettobebilled_Revised.aspx" id="aBack" runat="server" style="color: saddlebrown"><< Go back </a></li>
                    </ol>
                </div>
            </div>
        </div>
        <!-- /.container-fluid -->
    </div>
    <div class="col-lg-12">
        <div class="card">
            <div class="card-body">
                <table style="width: 100%;">
                    <tr>
                        <td>
                            <button id="senttoaccount_btnverifyorders" name="senttoaccount_btnverifyorders" onclick="return senttoaccount_verifyorders();" class="btn btn-success" style="border: solid 1px gray;"><i class="uil fs-0 me-2 uil-check"></i>&nbsp;Verify Orders</button>
                            <button id="senttoaccount_btnexporttoexcel" name="senttoaccount_btnexporttoexcel" onclick="return senttoaccount_exporttoexcel();" class="btn btn-secondary" style="display: none;">Export To Excel</button>
                            <button type="button" id="senttoaccount_btnpreviewinvoice" name="senttoaccount_btnpreviewinvoice" onclick="return senttoaccount_previewinvoice_with_other_billing_check();" class="btn btn-info" style="border: solid 1px gray;"><i class="uil fs-0 me-2 uil-invoice"></i>&nbsp;Preview Invoice</button>
                            <button id="senttoaccount_btnexportloanlist" name="senttoaccount_btnexportloanlist" onclick="return senttoaccount_exportloanlist();" class="btn btn-light" style="border: solid 1px gray;"><i class="uil fs-0 me-2 uil-list-ul"></i>&nbsp;Export Loan List</button>
                            <button type="button" id="senttoaccount_btnsendtoclient" name="senttoaccount_btnsendtoclient" onclick="return senttoaccount_senttoclient_with_other_billing_check();" class="btn btn-light" style="border: solid 1px gray;"><i class="uil fs-0 me-2 uil-list-ul"></i>&nbsp;Ready to send to client</button>
                            <button id="senttoaccount_btnsendtoproduction" name="senttoaccount_btnsendtoproduction" onclick="return senttoaccount_sendtoproduction();" class="btn btn-danger" style="float: right;"><i class="uil fs-0 me-2 uil-sign-in-alt"></i>&nbsp;Send Back To Production</button>
                        </td>
                    </tr>
                </table>
                <hr />
                <table>
                    <tr>
                        <td>
                            <input type="text" id="senttoaccount_invoicenumber" name="senttoaccount_invoicenumber" class="form-control" style="width: 400px; display: inline;" />
                            <input type="checkbox" id="senttoaccount_chkinvoicenumber" onclick="return senttoaccount_updateinvoicenumber();" />&nbsp;Click to update invoice number
                        </td>

                    </tr>
                </table>
                <hr />
                <div id="otherBillingAmountsSection" style="display:none;">
                    <h5>Other Billing Amounts</h5>
                    <table class="table table-bordered">
                        <thead><tr><th>Billing Type</th><th>Amount</th><th>Invoice Display Name</th><th>Remove</th></tr></thead>
                        <tbody id="otherBillingAmountsBody"></tbody>
                    </table>
                    <button type="button" class="btn btn-secondary" onclick="otherBillingAmounts_addRow();">+ Add Other Billing Amount</button>
                    <button type="button" class="btn btn-primary" onclick="return otherBillingAmounts_save();">Save Other Billing Amounts</button>
                    <hr />
                </div>
                <table class="table table-bordered" id="senttoaccount_table" style="width: 100%"></table>
            </div>
        </div>
    </div>
    <div class="modal fade" id="sendbacktoproduction">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">Send Back To Production</h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <table class="table">
                        <tr>
                            <td><b>Project #:</b></td>
                            <td>
                                <label id="sendbackprod_projectno" class="form-control" style="width:350px;"></label>
                            </td>
                        </tr>
                        <tr>
                            <td><b>Billing Period:</b></td>
                            <td>
                                <label id="sendbackprod_billingperiod" class="form-control" style="width:350px;"></label>
                            </td>
                        </tr>
                        <tr>
                            <td><b>Reason:</b></td>
                            <td>
                                <textarea id="senttoaccount_sendback_reason" name="senttoaccount_sendback_reason" class="form-control" style="width:350px;"></textarea>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="modal-footer justify-content-between">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button class="btn btn-primary" type="button" id="senttoaccount_btnsentbacktoproduction" onclick="return senttoaccount_sentbacktoproduction();">Send back to Production</button>
                </div>
            </div>
            <!-- /.modal-content -->
        </div>
        <!-- /.modal-dialog -->
    </div>

    <div class="modal fade" id="waitingpanel" tabindex="-1" data-bs-backdrop="static" aria-hidden="true">
        <div class="modal-dialog text-center">
            <img src="../Images/Load.gif" />
            <br />
            <span style="color: #fff; font-size: 24px; font-weight: bold; font-style: italic;" id="spntext">Document generation is in process. Please wait</span>
            <span style="color: #fff; font-size: 48px; font-weight: bold; font-style: italic; animation: animate 1s linear infinite;">&nbsp;. . . .</span>
        </div>
    </div>
    <div class="modal fade" id="otherBillingAmountWarningModal" tabindex="-1" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog"><div class="modal-content">
            <div class="modal-header"><h4 class="modal-title">Other Billing Amount Not Configured</h4></div>
            <div class="modal-body">Other billing amount is not configured, do you still want to proceed?</div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" onclick="otherBillingAmounts_continuePendingAction();">Yes</button>
                <button type="button" class="btn btn-secondary" data-dismiss="modal" onclick="pendingOtherBillingAction=null;">No</button>
            </div>
        </div></div>
    </div>
</asp:Content>
